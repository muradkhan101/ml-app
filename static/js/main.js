
class Paginator {
    constructor(endpoint, limit = 5, offset = 0) {
        this.endpoint = endpoint;
        this.limit = limit;
        this.offset = offset;
    }
    setOffset(offset) {
        this.offset = offset;
    }
    setLimit(limit) {
        this.limit = limit;
    }
    next(options) {
        const params = {
            ...options,
            offset: this.offset
        };
        const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
        const url = `${this.endpoint}?${queryParams}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            this.setOffset(this.offset + this.limit);
            return res;
        })
    }
}

// Set up audio context
(function() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const audioInLevel = audioContext.createGain();
    let audioIn = void 0;

    const allPlaylists = [];
    let currentPage = 'landing';
    window.location.hash = 'landing';
    const paginator = new Paginator('https://ml.tycc.io/playlist/more');
    let response;

    function getRecordingPermissions() {
        // Ask for mic permissions
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
            audioIn = audioContext.createMediaStreamSource(stream);
            audioIn.connect(audioInLevel);
            let permissions = document.querySelector('.permissions-success');
            permissions.classList.remove('transition-fade-in-hidden');
        }, (err) => {
            let permissions = document.querySelector('.permissions-fail');
            permissions.classList.remove('hidden');
            requestAnimationFrame(() => permissions.classList.remove('transition-fade-in-hidden'));
        })
    }
    function initRecording() {
        let isRecording = false;
    
        audioInLevel.gain.value = 1;
        const mixer = audioContext.createGain();
        audioInLevel.connect(mixer);
        // mixer.connect(audioContext.destination);
        
        // Set up audioRecorder
        const audioRecorder = new WebAudioRecorder(mixer, {
            workerDir: 'js/'
        });
        audioRecorder.onComplete = function(recorder, blob) {
            let f = new FileReader();
            f.onload = function() {
                const b64 = f.result;
                fetch('https://ml.tycc.io/playlist', {
                    method: 'POST',
                    body: JSON.stringify({audio: b64.slice(22)}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json()).then(res => {
                    response = res;
                    let playlistContainer = document.getElementById('playlist-holder');
                    playlistContainer.scrollIntoView();
                    return res;
                }).then(appendPlaylists);
            }
            // let url = URL.createObjectURL(blob);
            f.readAsDataURL(blob);
            // document.getElementById('audio').src = url;
        }
        document.getElementById('record').addEventListener('click', function(e) {
            // Start Recording
            if (!isRecording) {
                e.target.innerText = 'Stop Recording'
                audioRecorder.setOptions({
                    timeLimit: 3, // seconds
                    // encodeAfterRecord: encodingProcess === 'separate',
                    progressInterval: 1, // seconds
                });
                audioRecorder.startRecording();
            } else {
                e.target.innerText = 'Start Recording'
                audioRecorder.finishRecording();
            }
            isRecording = !isRecording;
        })
    }

    document.getElementById('to-permissions').addEventListener('click', function(e) {
        currentPage = 'permissions';
        window.history.pushState(null, null, '#permissions');
        window.setTimeout(() => getRecordingPermissions(), 100);
    })
    document.getElementById('to-recorder').addEventListener('click', function(e) {
        currentPage = 'recorder';
        window.history.pushState(null, null, '#recorder');
        initRecording();

        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(stream => {
            let analyzer = new AudioAnalyzer(stream);
            analyzer.connectNewSource().then(res => {
                let canvas = document.getElementById('audioVis');
                let barVisualization = new RoundBarVisualizer(canvas, analyzer);
                barVisualization.draw();
            })
        })
    })
    document.getElementById('load-more').addEventListener('click', function(e) {
        paginator.next({
            emotion: response.emotion,
            sentiment: response.sentiment
        }).then(res => res.json()).then(appendPlaylists);
    })
    function appendPlaylists(res) {
        let playlists = document.getElementById('playlists');
        const idArray = allPlaylists.map(p => p.id);
        allPlaylists.push(...res.playlists.filter(p => !idArray.includes(p)));
        let playlistElements = res.playlists.map(makePlaylistLink);
        document.querySelector('#recorder .accordion').classList.add('accordion-closed');
        document.getElementById('playlist-holder').classList.toggle('hidden');
        window.requestAnimationFrame(() => {
            let playlistContainer = document.getElementById('playlist-holder');
            playlistContainer.classList.remove('hidden');
            window.requestAnimationFrame(() => {
                function addAlbum(albums, current) {
                    if (current < albums.length) {
                        let item = albums[current];
                        item.classList.add('transition-fade-in');
                        item.classList.add('transition-fade-in-hidden');
                        playlists.appendChild(item);
                        window.setTimeout(() => {
                            item.classList.remove('transition-fade-in-hidden');
                            addAlbum(albums, current + 1);
                        }, 150)
                    }
                }
                addAlbum(playlistElements, 0)
            })
        })
    }

    function makePlaylistLink(playlist) {
        let link = document.createElement('a');
        link.href = playlist.external_urls.spotify;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        let img = document.createElement('img');
        img.src = playlist.images[0].url;
        img.alt = `Album art for the Spotify playlist ${playlist.name}`;

        link.classList.add('album');
        link.appendChild(img);
        return link;
    }

    window.onresize = function () {
        document.getElementById(currentPage).scrollIntoView({ behavior: 'instant' });
    }
})()

window.addEventListener('popstate', function(e) {
    document.querySelector(window.location.hash).scrollIntoView({ behavior: 'smooth' });
})