import os
import spotipy
import spotipy.oauth2 as oauth
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '')

class SpotipyHelper:
    def __init__(self):
        self.helper = self.setUpSpotipy()
    
    def setUpSpotipy(self):
        auth = oauth.SpotifyClientCredentials(CLIENT_ID, CLIENT_SECRET)
        token = auth.get_access_token()
        sp = spotipy.Spotify(auth=token)
        return sp

    def renew(self):
        self.helper = self.setUpSpotipy()
        return self.helper

    def get(self):
        if self.helper:
            return self.helper
        else:
            self.renew()