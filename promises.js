let http = 'https://swapi.dev/api/starships/';
const itemList = document.getElementById('items');
const modal = document.getElementById('modal');
const closeButton = document.getElementById('close');
const textContainer = document.querySelector('div.area');

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});


async function resolveNext(promise) {
    const promises = [];
    const resolved = [];
    promises.push(promise);

    for (const promise of promises){
        await promise
            .then(response => response.json())
            .then(commits => {
                if(commits.next){
                    promises.push(fetch(commits.next));
                }
                commits.results.forEach(item => resolved.push(item));
            })
            .catch(() => {})
    }
    return resolved;
}

resolveNext(fetch(http)).then(value => {
    value.forEach(element => {
        let item = document.createElement('li');
        item.style.margin = '5px 0';
        item.innerText = element['name'];
        let button = document.createElement('button');
        button.style.margin = '0 5px';
        button.innerText = 'more info';
        button.addEventListener('click', () => {
            fetch(element.url)
                .then(response => response.json())
                    .then(commits => {
                        console.log(commits.pilots);
                        let line = '';
                        for(let each in commits){
                            if(typeof commits[each] === 'string'){
                                if(['created', 'edited', 'url'].includes(each)) continue;
                                let key = each;
                                key = key.charAt(0).toUpperCase() + key.slice(1);
                                key = key.split('_').join(' ');
                                line += `<span>${key}:</span> ${commits[each]};<br>`
                            }
                        }
                        if(commits['pilots'] && commits['pilots'].length){
                            resolveAll(commits['pilots'].map(pilotUrl => fetch(pilotUrl)))
                                .then(response => {
                                    line += '<span>Starship pilots :</span> ';
                                    response.forEach((pilot) => {line += `${pilot.name}, `});
                                    line += '<br>';
                                    textContainer.innerHTML = line;
                                    modal.style.display = 'flex';
                                });
                        }
                        else{
                            textContainer.innerHTML = line;
                            modal.style.display = 'flex';
                        }
                    })
                        .catch(() => {})
        });
        item.append(button);
        itemList.append(item)
    });
});


async function resolveAll(promises) {
    const resolved = [];
    const handlers = promises.map(promise => (
        promise
            .then(response => response.json())
            .then(resp => resolved.push(resp))
            .catch(() => {})
    ));
    await Promise.all(handlers);
    return resolved;
}

document.getElementById('search-button').addEventListener('click', () => {
    const field = document.getElementById('search-field');
    const body = document.querySelector('body');
    let searchResults = document.getElementById('search-results');
    if(!searchResults){
        searchResults = document.createElement('div');
        searchResults.id = 'search-results';
    }
    fetch(`https://swapi.dev/api/people/?search=${field.value}`)
        .then(response => response.json())
        .then(resp => resp.results)
        .then(results => {
            if(results.length === 1){
                let details = '';
                for(let key in results[0]){
                    if(typeof results[0][key] === 'string'){
                        if(['created', 'edited', 'url', 'homeworld'].includes(key)) continue;
                        let keyString = key;
                        keyString = keyString.charAt(0).toUpperCase() + keyString.slice(1);
                        keyString = keyString.split('_').join(' ');
                        details += `<span>${keyString}:</span> ${results[0][key]};<br>`
                    }
                }
                searchResults.innerHTML = details;
                body.append(searchResults);
            }
            else if(results.length > 1){
                searchResults.innerText = null;
                results.forEach((result) => {
                    let a = document.createElement('a');
                    a.innerHTML = result.name + '<br>';
                    a.href = result.url;
                    searchResults.append(a);
                });
                body.append(searchResults);
            }
            else{
                if(searchResults) searchResults.remove();
            }
        })
        .catch(() => {})
});