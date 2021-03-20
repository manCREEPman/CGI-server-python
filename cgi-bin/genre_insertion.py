import cgi
import sqlite3
import os
import json
import sys


def form_values_str(source_list, mode=1):
    result_str = ''
    try:
        for i in range(len(source_list)):
            result_str += '\'' + source_list[i] + '\'' if isinstance(source_list[i], str) and mode == 1 \
                else str(source_list[i])
            if i != len(source_list) - 1:
                result_str += ', '
    finally:
        return result_str


def form_titled_json(title, message):
    return json.dumps({title: message})


def get_query_handler(cursor):
    request = cgi.FieldStorage(encoding='utf-8')
    response_json = {'status': 'The data successfully retrieved.', 'data': []}
    table_name = request.getfirst('table_name', '')
    print('Content-type: application/json\n')
    query_str = ''
    response = ''
    if table_name != '':
        if table_name in ['Artist', 'Music_genre']:
            query_str = 'SELECT * FROM {};'.format(table_name)
        elif table_name == 'Album':
            query_str = 'SELECT alb.album_id, art.artist_name, alb.album_name, alb.album_desc, alb.album_release_date' \
                        ' FROM Album alb JOIN Artist art on alb.artist_id = art.artist_id;'
        elif table_name == 'Composition':
            query_str = 'SELECT com.composition_id, art.artist_name, alb.album_name, ' \
                        'com.composition_title, com.composition_duration, com.composition_text, mg.genre_name ' \
                        'FROM Music_genre mg ' \
                        'JOIN Composition com on mg.genre_id = com.genre_id ' \
                        'JOIN Album alb on com.album_id = alb.album_id ' \
                        'JOIN Artist art on alb.artist_id = art.artist_id;'
        cursor.execute(query_str)
        for query_row in cursor.fetchall():
            column_list = []
            for column in query_row:
                column_list.append(column)
            response_json['data'].append(column_list)
        response += json.dumps(response_json)
    else:
        response += form_titled_json('status', 'Error: Wrong table_name parameter.')
    return response


def get_pk_from_table_by_name(cursor, table_name, name):
    target = 'genre_id' if table_name == 'Music_genre' else table_name.lower() + '_id'
    table_field = 'genre_name' if table_name == 'Music_genre' else table_name.lower() + '_name'
    query_str = 'SELECT {0} FROM {1} WHERE {2} = \'{3}\''.format(target, table_name, table_field, name)
    cursor.execute(query_str)
    retrieved_id = cursor.fetchone()
    if retrieved_id is not None:
        return retrieved_id[0]
    else:
        return -1


def data_insertion(cursor, json_query):
    try:
        table_name = json_query['table_name']
        columns = json_query['columns']
        values = json_query['values']
        columns_str = form_values_str(columns, mode=2)
        values_str = form_values_str(values)
        query_str = ''
        if table_name in ['Artist', 'Music_genre']:
            query_str = 'INSERT INTO {}({}) VALUES({});'.format(table_name, columns_str, values_str)
        else:
            if table_name == 'Album':
                artist_id = get_pk_from_table_by_name(cursor, 'Artist', json_query['artist_name'])
                if artist_id != -1:
                    query_str = 'INSERT INTO {0}({1}, {2}) VALUES({3}, {4});' \
                        .format(table_name, columns_str, 'artist_id', values_str, str(artist_id))
                else:
                    return 'Error: This artist doesn\'t exist in database.'
            elif table_name == 'Composition':
                album_id = get_pk_from_table_by_name(cursor, 'Album', json_query['album_name'])
                genre_id = get_pk_from_table_by_name(cursor, 'Music_genre', json_query['genre_name'])
                if genre_id != -1 and album_id != -1:
                    query_str = 'INSERT INTO {0}({1}, {2}, {3}) VALUES({4}, {5}, {6});' \
                        .format(table_name, columns_str, 'album_id',
                                'genre_id', values_str, str(album_id), str(genre_id))
                else:
                    return 'Error: Some of values don\'t exist in database.'
    except KeyError:
        return 'Error: Wrong arguments got.'
    cursor.execute(query_str)
    return 'The data successfully inserted.'


def last_data_inserted(cursor, data):
    try:
        query_str = ''
        table_name = data['table_name']
        if table_name in ['Music_genre', 'Artist']:
            table_field = 'genre_id' if table_name == 'Music_genre' else table_name.lower() + '_id'
            query_str = 'SELECT * FROM {0} where {1} = (select max({1}) from {0});'.format(table_name, table_field)
        elif table_name == 'Album':
            query_str = 'SELECT alb.album_id, art.artist_name, alb.album_name, alb.album_desc, alb.album_release_date' \
                        ' FROM Album alb JOIN Artist art on alb.artist_id = art.artist_id ' \
                        'WHERE alb.album_id = (SELECT max(album_id) from Album);'
        elif table_name == 'Composition':
            query_str = 'SELECT com.composition_id, art.artist_name, alb.album_name, ' \
                        'com.composition_title, com.composition_duration, com.composition_text, mg.genre_name ' \
                        'FROM Music_genre mg ' \
                        'JOIN Composition com on mg.genre_id = com.genre_id ' \
                        'JOIN Album alb on com.album_id = alb.album_id ' \
                        'JOIN Artist art on alb.artist_id = art.artist_id ' \
                        'WHERE com.composition_id = (SELECT max(composition_id) from Composition);'
        cursor.execute(query_str)
        result = cursor.fetchone()
        if result is not None:
            return [item for item in result]
    except KeyError:
        return []


def post_query_handler(cursor, connection):
    content_len = os.environ.get('CONTENT_LENGTH', '0')
    body = sys.stdin.read(int(content_len))
    data = json.loads(body)
    json_response = {}
    print('Content-type: application/json\n')
    response = ''
    json_response['status'] = data_insertion(cursor, data)
    json_response['new_data'] = last_data_inserted(cursor, data)
    connection.commit()
    response += json.dumps(json_response)
    return response


real_connection = sqlite3.connect('./cgi-bin/music_genres.db')
connection_cursor = real_connection.cursor()

if os.environ['REQUEST_METHOD'] == 'GET':
    print(get_query_handler(connection_cursor))
else:
    print(post_query_handler(connection_cursor, real_connection))

real_connection.commit()
real_connection.close()
