const pageInformation = {
    rootStyle: getComputedStyle(document.documentElement),
    chosenTitle: '',
    formData: {}
}

function initMusicGenreForm(){
    let htmlStr = "<div style=\"display: inline-block; width: 245px;\">Название жанра</div><input class=\"input-margin\" type=\"text\" id=\"genre_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Описание жанра</div><input class=\"input-margin\" type=\"text-area\" id=\"genre_description\">" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr
}

function initArtistForm(){
    let htmlStr = "<div style=\"display: inline-block; width: 245px;\">Имя музыканта / коллектива</div><input class=\"input-margin\" type=\"text\" id=\"artist_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Начало карьеры</div><input class=\"input-margin\" type=\"text\" id=\"start_career_date\">" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initAlbumForm(){
    let htmlStr = "<div style=\"display: inline-block; width: 245px;\">Имя музыканта / коллектива</div><input class=\"input-margin\" type=\"text\" id=\"artist_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Название альбома</div><input class=\"input-margin\" type=\"text\" id=\"album_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Описание альбома</div><input class=\"input-margin\" type=\"text-area\" id=\"album_desc\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Дата выпуска</div><input class=\"input-margin\" type=\"text\" id=\"album_release_date\">" +
    "<input id=\"send-button\" type=\"button\" value=\"Добавить\">"
    document.getElementById('selected-form').innerHTML = htmlStr 
}

function initCompositionForm(){
    let htmlStr = 
    "<div style=\"display: inline-block; width: 245px;\">Название альбома</div><input class=\"input-margin\" type=\"text\" id=\"album_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Название жанра</div><input class=\"input-margin\" type=\"text\" id=\"genre_name\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Название композиции</div><input class=\"input-margin\" type=\"text\" id=\"composition_title\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Длительность</div><input class=\"input-margin\" type=\"text\" id=\"composition_duration\">" +
    "<br>" +
    "<div style=\"display: inline-block; width: 245px;\">Текст</div><input class=\"input-margin\" type=\"text-area\" id=\"composition_text\">" +
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

function generateTableHeaders(){
    let headersRow = document.createElement('tr')
    switch(+pageInformation.chosenTitle[3]){
        case 1:
            headersRow.innerHTML = "<th>ID</th><th>Название жанра</th><th>Описание жанра</th>"
        break
        case 2:
            headersRow.innerHTML = "<th>ID</th><th>Имя исполнителя / коллектива</th><th>Дата создания</th>"
        break
        case 3:
            headersRow.innerHTML = "<th>ID</th><th>Имя исполнителя / коллектива</th><th>Название альбома</th><th>Описание альбома</th><th>Дата выпуска</th>"
        break
        case 4:
            headersRow.innerHTML = "<th>ID</th><th>Имя исполнителя / коллектива</th><th>Название альбома</th><th>Название композиции</th><th>Длительность</th><th>Длительность</th><th>Жанр</th>"
        break
    }
    return headersRow
}

function displayTableData(dataObj){
    if(!dataObj.status.includes('Error')){
        if(dataObj.data.length != 0){
            let table = document.createElement('table')
            table.id = 'selected-table'
            table.border = 1
            table.width = '100%'
            table.append(generateTableHeaders())
            let dataJSON = dataObj.data
            for(let i = 0; i < dataJSON.length; i++){
                let tableRow = document.createElement('tr')
                let rowData = dataJSON[i]
                for(let j = 0; j < rowData.length; j++){
                    let rowCell = document.createElement('td')
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

function getTableNameBySelectedTitle(){
    let titleNumber = +pageInformation.chosenTitle[3]
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
    return tableName
}

function drawTable(){
    let tableContainer = document.getElementById('selected-table-space')
    tableContainer.innerHTML = ''
    getQueryByTableName(getTableNameBySelectedTitle()).then(
        (jsonData) => {
            let table = displayTableData(jsonData)
            if(table) tableContainer.append(table)
        }
    )
}

function insertData(){
    let titleNumber = +pageInformation.chosenTitle[3]
    let formData = {columns: [], values: [], table_name: getTableNameBySelectedTitle()}
    let inputs = document.getElementById('selected-form').getElementsByTagName('input')
    switch(titleNumber){
        case 3:
            if(document.getElementById('artist_name').value != ''){
                formData.artist_name = document.getElementById('artist_name').value
            }
            else return false
        break
        case 4:
            if(document.getElementById('genre_name').value != ''){
                formData.genre_name = document.getElementById('genre_name').value
            }
            else return false
            if(document.getElementById('album_name').value != ''){
                formData.album_name = document.getElementById('album_name').value
            }
            else return false
        break
    }
    for(let i = titleNumber - 2 <= 0 ? 0 : titleNumber - 2; i < inputs.length; i++){
        if(inputs[i].value != '' && inputs[i].type != 'button'){
            formData.columns.push(inputs[i].id)
            formData.values.push(inputs[i].value)
        }
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

function appendOrCreateSelectedTable(newDataRow){
    let selectedTable = document.getElementById('selected-table')
    if(selectedTable) selectedTable.append(newDataRow)
    else {
        let selectedTable = document.createElement('table')
        selectedTable.id = 'selected-table'
        selectedTable.border = 1
        selectedTable.width = '100%'
        selectedTable.append(generateTableHeaders())
        selectedTable.append(newDataRow)
        document.getElementById('selected-table-space').append(selectedTable)
    }
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
                        let newCol = document.createElement('td')
                        newCol.innerHTML = newData[i]
                        newDataRow.append(newCol)
                    }
                    appendOrCreateSelectedTable(newDataRow)
                }
            }
        )
    }
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
    for(let i = 1; i <= 4; i++){
        document.getElementById('nav' + i).addEventListener('click', titleClickEvent)
    }
    drawForm()
    drawTable()
    document.getElementById('send-button').addEventListener('click', sendButtonHandler)
}

pageInit()