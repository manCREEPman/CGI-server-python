const pageInformation = {
    rootStyle: getComputedStyle(document.documentElement),
    chosenTitle: '',
    formData: {}
}

function initMusicGenreForm(){
    let htmlStr = "<label>Название жанра<input class=\"input-margin\" type=\"text\" id=\"genre_name\"></label>" +
    "<br>" +
    "<label>Описание жанра<input class=\"input-margin\" type=\"text-area\" id=\"genre_description\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr
}

function initArtistForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" id=\"artist_name\"></label>" +
    "<br>" +
    "<label>Начало карьеры<input class=\"input-margin\" type=\"text\" id=\"start_career_date\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initAlbumForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" id=\"artist_name\"></label>" +
    "<br>" +
    "<label>Название альбома<input class=\"input-margin\" type=\"text\" id=\"album_name\"></label>" +
    "<br>" +
    "<label>Описание альбома<input class=\"input-margin\" type=\"text-area\" id=\"album_desc\"></label>" +
    "<br>" +
    "<label>Дата выпуска<input class=\"input-margin\" type=\"text\" id=\"album_release_date\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initCompositionForm(){
    let htmlStr = "<label>Имя музыканта / коллектива<input class=\"input-margin\" type=\"text\" id=\"artist_name\"></label>" +
    "<br>" +
    "<label>Название альбома<input class=\"input-margin\" type=\"text\" id=\"album_name\"></label>" +
    "<br>" +
    "<label>Название композиции<input class=\"input-margin\" type=\"text\" id=\"composition_name\"></label>" +
    "<br>" +
    "<label>Название жанра<input class=\"input-margin\" type=\"text\" id=\"genre_name\"></label>" +
    "<br>" +
    "<label>Длительность<input class=\"input-margin\" type=\"text\" id=\"composition_duration\"></label>" +
    "<br>" +
    "<label>Текст<input class=\"input-margin\" type=\"text-area\" id=\"composition_text\"></label>" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function drawForm(){
    let titleNumber = +pageInformation.chosenTitle[3]
    switch(titleNumber){
        case 1:
            initMusicGenreForm()
        break
        case 2:
            initArtistForm()
        break
        case 3:
            initAlbumForm()
        break
        case 4:
            initCompositionForm()
        break
    }
}

async function getQueryByTableName(table_name){
    let url = `./cgi-bin/genre_insertion.py?table_name=${table_name}`
    let response = await fetch(url)
    return response.json()
}

function displayTableData(dataObj){
    if(!dataObj.status.includes('Error')){
        if(dataObj.data.length != 0){
            let table = document.createElement('table')
            table.id = 'selected-table'
            let dataJSON = dataObj.data
            for(let i = 0; i < dataJSON.length; i++){
                let tableRow = document.createElement('tr')
                let rowData = dataJSON[i]
                for(let j = 0; j < rowData.length; j++){
                    let rowCell = document.createElement('th')
                    rowCell.innerHTML = rowData[j]
                    tableRow.append(rowCell)
                }
                table.append(tableRow)
            }
            return table
        }
    }
    return false
}

function drawTable(){
    let titleNumber = +pageInformation.chosenTitle[3]
    let tableContainer = document.getElementById('selected-table-space')
    tableContainer.innerHTML = ''
    let tableName = ''
    switch(titleNumber){
        case 1:
            tableName = 'Music_genre'
        break
        case 2:
            tableName = 'Artist'
        break
        case 3:
            tableName = 'Album'
        break
        case 4:
            tableName = 'Composition'
        break
    }
    getQueryByTableName(tableName).then(
        (jsonData) => {
            let table = displayTableData(jsonData)
            if(table) tableContainer.append(table)
        }
    )
}

function insertData(){
    let titleNumber = +pageInformation.chosenTitle[3]
    let formData = {columns: [], values: []}
    let inputs = document.getElementById('selected-form').getElementsByTagName('input')
    switch(titleNumber){
        case 3:
            if(document.getElementById('artist_name').value != ''){
                formData.artist_name = document.getElementById('artist_name').value
            }
            else return false
            for(let i = 1; i < inputs.length; i++){
                if(inputs[i].value != ''){
                    formData.columns.append(inputs[i].id)
                    formData.values.append(inputs[i].value)
                }
            }
        break
        case 4:
            if(document.getElementById('artist_name').value != ''){
                formData.artist_name = document.getElementById('artist_name').value
            }
            else return false
            if(document.getElementById('album_name').value != ''){
                formData.album_name = document.getElementById('album_name').value
            }
            else return false
            for(let i = 2; i < inputs.length; i++){
                if(inputs[i].value != ''){
                    formData.columns.append(inputs[i].id)
                    formData.values.append(inputs[i].value)
                }
            }
        break
        default:
            for(let i = 0; i < inputs.length; i++){
                if(inputs[i].value != ''){
                    formData.columns.append(inputs[i].id)
                    formData.values.append(inputs[i].value)
                }
            }
        break
    }
    return formData
}

async function postQueryByTableName(formData){
    let response = await fetch('/cgi-bin/genre_insertion.py',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        }
    )
    return response.json()
}

function sendButtonHandler(){
    let formData = insertData()
    if(formData){
        postQueryByTableName(formData).then(
            (responseJSON) => {
                if(!responseJSON.status.includes('Error')){
                    let newDataRow = document.createElement('tr')
                    let newData = responseJSON.new_data
                    for(let i = 0; i < newData.length; i++){
                        let newCol = document.createElement('th')
                        newCol.innerHTML = newData[i]
                        newDataRow.append(newCol)
                    }
                    document.getElementById('selected-table').append(newDataRow)
                }
            }
        )
    }
}

async function test(){
    // let response = await fetch('/cgi-bin/genre_insertion.py?table_name=Artist')
    // const data = {
    //     table_name: 'Artist',
    //     columns: [1, '2', 3],
    //     data: ['asdf', 12, 'typ']
    // }
    // let response = await fetch('/cgi-bin/genre_insertion.py',
    // {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(data),
    // })
    // let response = await fetch('/cgi-bin/genre_insertion.py?table_name=Composition')
    // console.log(response)
    // console.log(response.text())
    // console.log(response.status)
    // console.log(response.json)
    // let root = document.documentElement
    // root.style.setProperty('--title-bg-color', '#727262')
    console.log('penis')
}

function titleClickEvent(event){
    let prevChoose = document.getElementById(pageInformation.chosenTitle)
    prevChoose.classList.remove('table-title-chosen')
    pageInformation.chosenTitle = event.currentTarget.id
    let currentChoose = document.getElementById(pageInformation.chosenTitle)
    currentChoose.classList.add('table-title-chosen')
    drawForm()
    drawTable()
    document.getElementById('send-button').addEventListener('click', sendButtonHandler)
}

function pageInit(){
    pageInformation.chosenTitle = 'nav1'
    document.getElementById('nav1').classList.add('table-title-chosen')
    // подключить обработчики событий на каждый заголовок
    for(let i = 1; i <= 4; i++){
        document.getElementById('nav' + i).addEventListener('click', titleClickEvent)
    }
    drawForm()
    drawTable()
    document.getElementById('send-button').addEventListener('click', test)
    // getQueryByTableName('Artist').then(
    //     (jsonOb) => {
    //         console.log(jsonOb.status)
    //         console.log(jsonOb.data)
    //         console.log(displayTableData(jsonOb))
    //     }
    // )
    
    // тут вызвать get-запрос на отображение данных таблицы "Музыкальный жанр"
}

pageInit()