"""
    Необходимо создать БД по заданной теме. БД должна содержать не менее трёх таблиц. Должна присутствовать возможность
    импорта/экспорта из/в  XML-файл, а также не менее трёх статистических запросов.
"""
import sqlite3


def tables_creation():
    connection = sqlite3.connect('./music_genres.db')
    cursor = connection.cursor()
    create_statements = [
        """
            CREATE TABLE IF NOT EXISTS Artist (
                artist_id INTEGER PRIMARY KEY AUTOINCREMENT,
                artist_name VARCHAR(200),
                start_career_date DATE
            );
        """,
        """
            CREATE TABLE IF NOT EXISTS Album (
                album_id INTEGER PRIMARY KEY AUTOINCREMENT,
                artist_id INTEGER REFERENCES Artist (artist_id) ON DELETE CASCADE,
                album_name VARCHAR(200),
                album_desc VARCHAR(1500),
                album_release_date DATE
            );
        """,
        """
            CREATE TABLE IF NOT EXISTS Composition (
                composition_id INTEGER PRIMARY KEY AUTOINCREMENT,
                album_id INTEGER REFERENCES Album (album_id) ON DELETE CASCADE,
                genre_id INTEGER REFERENCES Music_genre (genre_id),
                composition_title VARCHAR(200),
                composition_duration TIME,
                composition_text VARCHAR(2000)
            );
        """,
        """
            CREATE TABLE IF NOT EXISTS Music_genre (
                genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
                genre_name VARCHAR(70),
                genre_description VARCHAR(2000)
            );
        """
    ]

    cursor.executescript(''.join(create_statements))
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print(str(cursor.fetchall()))
    connection.close()


def data_inserting():
    pass


def data_retrieving():
    connection = sqlite3.connect('./music_genres.db')
    cursor = connection.cursor()
    cursor.execute('select * from Music_genre;')
    print(cursor.fetchall())


data_retrieving()
