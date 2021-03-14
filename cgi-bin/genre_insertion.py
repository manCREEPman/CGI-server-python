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
    table_name = request.getfirst('table_name', '')
    response = 'Content-type: application/json\n'
    if table_name != '':
        query = 'SELECT * FROM {};'.format(table_name)
        cursor.execute(query)
        response = {'data': []}
        for query_row in cursor.fetchall():
            column_list = []
            for column in query_row:
                column_list.append(column)
            response['data'].append(column_list)
        response += json.dumps(response)
    else:
        response += form_titled_json('status', 'Error: Table is not exists.')
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
        table_name = data['table_name']
        table_field = 'genre_id' if table_name == 'Music_genre' else table_name.lower() + '_id'
        cursor.execute('SELECT * FROM {0} where {1} = (select max({1}) from {0});'.format(table_name, table_field))
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
    response = 'Content-type: application/json\n'
    json_response['status'] = data_insertion(cursor, data)
    json_response['new_data'] = last_data_inserted(cursor, data)
    connection.commit()
    response += json.dumps(json_response)
    return response


connection = sqlite3.connect('music_genres.db')
connection_cursor = connection.cursor()
# connection_cursor.execute('SELECT artist_id from Artist WHERE artist_name = \'{}\';'.format('debil'))
# print(connection_cursor.fetchone())
data1 = {
    'table_name': 'Album',
    'columns': ['album_name', 'album_desc', 'album_release_date'],
    'values': ['Pashkovka', 'Ssanina', '13.02.2021'],
    'artist_name': 'Local Memes'
}
data2 = {
    'table_name': 'Music_genre',
    'columns': ['genre_name', 'genre_description'],
    'values': ['Pash-rap', 'Ssanina'],
    'artist_name': 'Local Memes'
}
# table_name = 'Album'
# columns = ['album_name', 'album_desc', 'album_release_date', 'artist_name']
# values = ['Pashkovka', 'Ssanina', '13.02.2021', 'Local Memes']
# print(data_insertion(connection_cursor, table_name, columns, values))
# connection_cursor.execute('SELECT * FROM Artist WHERE artist_name = \'Local Memes\';')
# print(connection_cursor.fetchone())
print(data_insertion(connection_cursor, data2))
print(last_data_inserted(connection_cursor, data2))
connection.commit()
connection.close()
