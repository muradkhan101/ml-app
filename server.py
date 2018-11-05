from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from mono import convertB64ToMonoAndSave
from wav_to_flac import convertWavToFlac
from nn import getSoundInfo

from playlist import playlistMap

import json
import os
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/playlist', methods=['POST'])
@cross_origin()
def getPlaylist():
    data = request.get_json()
    audioB64 = data['audio']
    wavFile = audioB64[-24:] + '.wav'
    flacFile = audioB64[-24:] + 'flac'
    convertB64ToMonoAndSave(audioB64, wavFile)
    convertWavToFlac(wavFile, flacFile)
    sentiment, emotionLabel = getSoundInfo(flacFile, wavFile)
    gender, emotion = emotionLabel.split('_')
    os.remove(flacFile)
    os.remove(wavFile)

    res = {'emotion': emotion, 'sentiment': sentiment, 'gender': gender, 'playlists': playlistMap[emotion][sentiment]}
    return jsonify(res)