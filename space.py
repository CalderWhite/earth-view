import urllib.request
from datetime import datetime
from progress.bar import ShadyBar
import json, progress
global auth
auth = "SJq4GBtJ3OIhnA5rcD0XrnMuvTi1km6lOaE3qNVI"
def findMyPos():
    gpsOn = False
    if gpsOn:
        print("dunno m8")
    else:
        # if all else fails, use the ip
        j = json.loads(urllib.request.urlopen('http://ip-api.com/json').read().decode('utf-8'))
        if j["status"] == "success":
            return (j["lat"],j["lon"])
        else:
            raise Exception("Hit error while locating with ip : [%s]" % j["message"])

def findMe(coords,print_status=True):
    def prnt(msg):
        if print_status:
            print(msg)
    lat,lon = coords
    # api base urls
    assets_url = "https://api.nasa.gov/planetary/earth/assets?api_key=%s&lat=%s&lon=%s" % (auth,lat,lon)
    image_url = "https://api.nasa.gov/planetary/earth/imagery?api_key=%s&lat=%s&lon=%s" % (auth,lat,lon)
    # return all dates an image was taken of this exact coordinate
    prnt("gathering image dates...")
    available = json.loads(urllib.request.urlopen(assets_url).read().decode('utf-8'))
    if available["count"] == 0:
        raise Exception("There are no images LANDSAT images for these coordinates.")
    else:
        # order by date (today, to the beginning of recorded time)
        # NASA formats their dates as follows:
        # YYYY-MM-DD T HH:MM:SS
        # so, March 16rd, 2017 1:30pm with 20 seconds would be
        # 2017-03-16T13:30:20
        available = sorted(available["results"], key=lambda x: datetime.strptime(x["date"].replace("-","/"), '%Y/%m/%dT%H:%M:%S'))
        images = []
        bar = ShadyBar('Gathering image urls', max=len(available))
        for asset in available:
            # [10:] strips off the hour,minute and second
            url = image_url + "&date=" + asset["date"][:10]
            j = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
            images.append(j)
            bar.next()
        bar.finish()
        return images
pos = findMyPos()
print(findMe(pos))