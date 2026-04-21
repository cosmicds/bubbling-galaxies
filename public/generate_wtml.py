import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

# get image dimensions
im = Image.open('./I5_pngs/frame_100.png')
width, height = im.size

file = Path('./i5-template.wtml')

tree = ET.parse(file)

root = tree.getroot()
place = root.find('Place')
if place is None:
    raise ValueError("No Place element found in the WTML file")
root.remove(place)

# Position near IC 5332
# 23 34 27.49 -36 06 03.9
RA = 15 * (23 + 34 / 60 + 27.49 / 3600)
DEC = -(36 + 6 / 60 + 3.9 / 3600)

image_width_arcmin = 13 / 60 # degrees
pixScale = image_width_arcmin / width

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
    
    image_set.set('OffsetX', str(width / 2))
    image_set.set('OffsetY', str(height / 2))
    image_set.set('BaseDegreesPerTile', str(pixScale))
    root.append(new_place)

tree.write('i5_all.wtml')



    
file = Path('./i5-template.wtml')

tree = ET.parse(file)

root = tree.getroot()
place = root.find('Place')
if place is None:
    raise ValueError("No Place element found in the WTML file")
root.remove(place)

# Position near IC 5332
# 23 34 27.49 -36 06 03.9
RA = 15 * (23 + 34 / 60 + 27.49 / 3600)
DEC = -(36 + 6 / 60 + 3.9 / 3600)

image_width_arcmin = 13 / 60 # degrees
pixScale = image_width_arcmin / width

# new_place.set('Name', f"IC 5332")


new_place = ET.fromstring(ET.tostring(place))
new_place.set("Dec", str(DEC))
new_place.set("RA", str(RA/15))
new_place.set('Name', f"IC 5332 BACKING")
new_place.set('Constellation', 'SCL')


image_set = new_place.find('ForegroundImageSet/ImageSet')
image_set.set('Url', "./backing.png")
image_set.set('Name', f"IC 5332 BACKING")
image_set.set('CenterX', str(RA))
image_set.set('CenterY', str(DEC))

image_set.set('OffsetX', str(width / 2))
image_set.set('OffsetY', str(height / 2))
image_set.set('BaseDegreesPerTile', str(pixScale))
root.append(new_place)

tree.write('i5_backing.wtml')