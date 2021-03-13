import cgi
import sqlite3
import os
import json
import sys


def form_values_str(response_dict, mode=1):
    result_str = ''
    source_list = []
    try:
        if mode == 1:
            source_list = response_dict['data']
        elif mode == 2:
            source_list = response_dict['columns']
        for i in range(len(source_list)):
            result_str += '\'' + source_list[i] + '\'' if isinstance(source_list[i], str) and mode == 1 \
                        else str(source_list[i])
            if i != len(source_list) - 1:
                result_str += ', '
    finally:
        return result_str


def form_error_json(message):
    return json.dumps({'error': message})


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
        response += form_error_json('Table is not exists.')
    return response


def get_id_by_name(cursor, table_name :str, name):
    field = table_name.lower() + '_id'
    cursor.execute('SELECT {0} from {1} WHERE {0} = \'{2}\';'.format(field, table_name, name))
    retrieved_id = cursor.fetchone()[0]
    if retrieved_id is not None:
        return retrieved_id
    else:
        return -1


def data_insertion(cursor, table_name, columns, values):
    query_structure = {}
    columns_str = form_values_str(columns, mode=2)
    values_str = form_values_str(values)
    query_str = ''
    for i in range(len(columns)):
        query_structure[columns[i]] = values[i]
    if table_name in ['Artist', 'Music_genre']:
        query_str = 'INSERT INTO {}({}) VALUES({});'.format(table_name, columns_str, values_str)
    else:
        target = table_name.lower()
        target_id = get_id_by_name(cursor, table_name, query_structure[target + '_name'])
        if target_id != -1:
            query_str = 'INSERT INTO {}({}, artist_id) VALUES({}, {});'\
                .format(table_name, columns_str, values_str, str(target_id))
        else:
            return 'This {} doesn\'t exist in database.'.format(target)
    cursor.execute(query_str)
    return 'The data successfully inserted.'


def post_query_handler(cursor):
    content_len = os.environ.get('CONTENT_LENGTH', '0')
    body = sys.stdin.read(int(content_len))
    data = json.loads(body)
    response = 'Content-type: application/json\n'
    try:
        table_name = data['table_name']
        columns = data['columns']
        values = data['values']

    except KeyError:
        response += form_error_json('Wrong arguments got.')
        return response

    response += str(data)
    return response


connection = sqlite3.connect('./cgi-bin/music_genres.db')
connection_cursor = connection.cursor()
connection_cursor.execute('SELECT artist_id from Artist WHERE artist_name = \'{}\';'.format('debil'))
print(connection_cursor.fetchone())
connection.close()
