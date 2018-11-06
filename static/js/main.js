// Set up audio context
(function() {
    const main = document.querySelector('main');
    document.getElementById('landing').scrollIntoView();
    const audioContext = new AudioContext;
    const audioInLevel = audioContext.createGain();
    let audioIn = void 0;
    function getRecordingPermissions() {
        // Ask for mic permissions
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
            audioIn = audioContext.createMediaStreamSource(stream);
            audioIn.connect(audioInLevel);
            let permissions = document.querySelector('.permissions-success');
            permissions.classList.remove('hidden');
            permissions.classList.add('visible');

            let failed = document.querySelector('.permissions-fail');
            if (failed.classList.contains('visible')) {
                permissions.classList.add('hidden');
                permissions.classList.remove('visible');
            }
        }, (err) => {
            let permissions = document.querySelector('.permissions-fail');
            permissions.classList.remove('hidden');
            permissions.classList.add('visible');
            document.querySelector('retry-permissions').addEventListener('click', getRecordingPermissions);
        })
    }
    function initRecording() {
        let isRecording = false;
    
        audioInLevel.gain.value = 1;
        const mixer = audioContext.createGain();
        audioInLevel.connect(mixer);
        mixer.connect(audioContext.destination);
        
        // Set up audioRecorder
        const audioRecorder = new WebAudioRecorder(mixer, {
            workerDir: 'js/'
        });
        audioRecorder.onComplete = function(recorder, blob) {
            let f = new FileReader();
            f.onload = function() {
                const b64 = f.result;
                fetch('http://127.0.0.1:5000/playlist', {
                    method: 'POST',
                    body: JSON.stringify({audio: b64.slice(22)}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    console.log(res);
                    window.scrollX(-100);
                })
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
        document.getElementById('permissions').scrollIntoView({behavior: 'smooth'})
        window.setTimeout(() => getRecordingPermissions(), 100);
    })
    document.getElementById('to-recorder').addEventListener('click', function(e) {
        document.getElementById('recorder').scrollIntoView({behavior: 'smooth'});
        initRecording();
    })
})()