
let albumList = [];

function refreshAlbum() {
    var random = albumList[Math.floor(Math.random() * albumList.length)];

    let p = document.createElement('p');
    p.className = 'album-title';
    p.innerText = random['artistName'] + ' - ' + random['albumName'];

    let img = document.createElement('img');
    img.src = random['albumCover'];

    let a = document.createElement('a');
    a.setAttribute("href", random['albumURL']);
    a.setAttribute("target", '_blank');
    a.setAttribute('class', 'link-success');

    let albums_div = document.getElementById('albums');
    albums_div.innerHTML = '';
    albums_div.appendChild(p);
    albums_div.appendChild(a);
    a.appendChild(img);
    a.appendChild(p);

    let ul = document.createElement('ul');
    ul.className = 'tracklist';

    random['tracks'].forEach(track => {
        let li = document.createElement('li');
        li.innerHTML = '<div><span><b>' + track['number'] + '. ' + '</b>' + track['name'] + ' ' + '</span>' + formatMilliseconds(track['length'], true) + '</div>';
        ul.appendChild(li);
    });
    let li = document.createElement('li');
    li.setAttribute('class', 'total-length');
    li.innerHTML = '<div><span>Length:</span> ' + formatMilliseconds(random['albumLength'], true) + '</div>';
    ul.appendChild(li);

    albums_div.appendChild(ul);
}

function formatMilliseconds(milliseconds, padStart) {
    function pad(num) {
        return `${num}`.padStart(2, '0');
    }
    let asSeconds = milliseconds / 1000;

    let hours = undefined;
    let minutes = Math.floor(asSeconds / 60);
    let seconds = Math.floor(asSeconds % 60);

    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        minutes %= 60;
    }

    return hours
        ? `${padStart ? pad(hours) : hours}:${pad(minutes)}:${pad(seconds)}`
        : `${padStart ? pad(minutes) : minutes}:${pad(seconds)}`;
}

(function () {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */


    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    function saveAlbumData(albums) {
        albums.items.forEach(element => {
            let albumData = [];
            albumData['artistName'] = element.album.artists[0].name;
            albumData['albumName'] = element.album.name;
            albumData['albumURL'] = element.album.external_urls.spotify;
            albumData['albumCover'] = element.album.images[1].url;
            albumData['tracks'] = [];
            let lengthCount = 0;
            element.album.tracks.items.forEach(track => {
                let trackInfo = [];
                trackInfo['number'] = track.track_number;
                trackInfo['length'] = track.duration_ms;
                lengthCount += track.duration_ms;
                trackInfo['name'] = track.name;
                albumData['tracks'].push(trackInfo);
            });
            albumData['albumLength'] = lengthCount;

            albumList.push(albumData);
        });

        if (albums.next) {
            getAlbums(albums.next);
        } else {
            refreshAlbum();
            $('#loader').hide();
            $('#btn-refresh').show();
        }
    }

    function getAlbums(url) {
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                saveAlbumData(response);
            }
        });
    }

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            $('#login').hide();
            $('#loggedin').show();
            $('#loader').show();
            getAlbums('https://api.spotify.com/v1/me/albums?limit=50');
        } else {
            $('#login').show();
            $('#loggedin').hide();
        }
    }
})();