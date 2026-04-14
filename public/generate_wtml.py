import xml.etree.ElementTree as ET
from pathlib import Path

file = Path('./i5-template.wtml')

tree = ET.parse(file)

root = tree.getroot()
place = root.find('Place')
if place is None:
    raise ValueError("No Place element found in the WTML file")
root.remove(place)

# Position near IC 5332
RA = 353 + 42 / 60 + 35.0315 / 3600 
DEC = -(36 + 5 / 60 + 60 / 3600)
pixScale = 0.45 / 3600 # 0.25 arcsec/pixel

# new_place.set('Name', f"IC 5332")

for i in range(0, 49):
    new_place = ET.fromstring(ET.tostring(place))
    new_place.set("Dec", str(DEC))
    new_place.set("RA", str(RA/15))
    new_place.set('Name', f"IC 5332 {i}")
    new_place.set('Constellation', 'SCL')
    
    
    image_set = new_place.find('ForegroundImageSet/ImageSet')
    url = image_set.get('Url')
    new_url = url.replace("frame_100.png", f"frame_{100+i}.png")
    image_set.set('Url', new_url)
    image_set.set('Name', f"IC 5332 {i}")
    image_set.set('CenterX', str(RA))
    image_set.set('CenterY', str(DEC))
    image_set.set('BaseDegreesPerTile', str(pixScale))
    root.append(new_place)

tree.write('i5_all.wtml')
    