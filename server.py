from flask import Flask, request, jsonify, Response
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

import spotipy
import spotipy.oauth2 as auth
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '')
auth = auth.SpotifyClientCredentials(CLIENT_ID, CLIENT_SECRET)
token = auth.get_access_token()
sp = spotipy.Spotify(auth=token)

@app.route('/playlist', methods=['POST'])
@cross_origin()
def getPlaylist():
    data = request.get_json()
    audioB64 = data['audio']
    fileStart = audioB64[-24:].replace('/', '')
    wavFile = fileStart + '.wav'
    flacFile = fileStart + '.flac'
    convertB64ToMonoAndSave(audioB64, wavFile)
    convertWavToFlac(wavFile, flacFile)
    sentiment, emotionLabel = getSoundInfo(flacFile, wavFile)
    gender, emotion = emotionLabel.split('_')
    os.remove(flacFile)
    os.remove(wavFile)

    res = {'emotion': emotion, 'sentiment': sentiment, 'gender': gender, 'playlists': playlistMap[emotion][sentiment]['preset']}
    return jsonify(res)

@app.route('/playlist/more', methods=['GET'])
@cross_origin()
def searchPlaylist():
    emotion = request.args.get('emotion')
    sentiment = request.args.get('sentiment')
    offset = request.args.get('offset') or 0
    try:
        query = playlistMap[emotion][sentiment]['search']
    except:
        return Response("{'error': 'The value supplied for either 'sentiment' or 'emotion' isn't part of the allowed values'", status=400, mimetype='application/json')
    results = sp.search(query, type='playlist', limit=5, offset=offset)
    res = {'playlists': results['playlists']['items']}
    return jsonify(res)
