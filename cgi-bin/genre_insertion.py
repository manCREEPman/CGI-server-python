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
        response += json.dumps({'error': 'Table is not exists.'})


def post_query_handler(cursor):
    content_len = os.environ.get('CONTENT_LENGTH', '0')
    body = sys.stdin.read(int(content_len))
    data = json.loads(body)
    try:
        table_name = data['table_name']
        columns_str = form_values_str(data['columns'], mode=2)
        values_str = form_values_str(data['values'])
    finally:
        pass

    response = 'Content-type: application/json\n'
    query_str = 'INSERT INTO {}({}) VALUES({});'.format(data['table_name'], columns_str, values_str)

    response += str(data)


connection = sqlite3.connect('./cgi-bin/music_genres.db')
connection_cursor = connection.cursor()

connection.close()
