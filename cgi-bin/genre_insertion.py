import cgi
import sqlite3
import os
import json
import sys

connection = sqlite3.connect('./cgi-bin/music_genres.db')
cursor = connection.cursor()


def form_values_str(response_dict, mode=1):
    result_str = ''
    if mode == 1:
        values = response_dict['data']
        for i in range(len(values)):
            if isinstance(values[i], int):
                result_str += str(values[i])
            elif isinstance(values[i], str):
                result_str += '\'' + values[i] + '\''
            if i != len(values) - 1:
                result_str += ', '
    elif mode == 2:
        columns = response_dict['columns']
        for i in range(len(columns)):
            result_str += str(columns[i])
            if i != len(columns) - 1:
                result_str += ', '
    return result_str


if os.environ['REQUEST_METHOD'] == 'POST':
    content_len = os.environ.get('CONTENT_LENGTH', '0')
    body = sys.stdin.read(int(content_len))
    data = json.loads(body)
    try:
        table_name = data['table_name']
        columns_str = form_values_str(data['columns'], mode=2)
        values_str = form_values_str(data['values'])
    except:
    
    print("Content-type: application/json\n")
    query_str = 'INSERT INTO {}({}) VALUES({});'.format(data['table_name'], columns_str, values_str)

    print(data)

elif os.environ['REQUEST_METHOD'] == 'GET':
    request = cgi.FieldStorage(encoding='utf-8')
    table_name = request.getfirst('table_name', '')
    print("Content-type: application/json\n")
    if table_name != '':
        query = 'SELECT * FROM {};'.format(table_name)
        cursor.execute(query)
        response = {'data': []}
        for query_row in cursor.fetchall():
            column_list = []
            for column in query_row:
                column_list.append(column)
            response['data'].append(column_list)
        print(json.dumps(response))
    else:
        print(json.dumps({'error': 'Table is not exists.'}))

connection.close()
