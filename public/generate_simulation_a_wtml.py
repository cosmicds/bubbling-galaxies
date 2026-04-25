import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

# get image dimensions
im = Image.open('./simulation_a_pngs/frame_100.png')
width, height = im.size

file = Path('./template.wtml')

tree = ET.parse(file)

root = tree.getroot()
place = root.find('Place')
if place is None:
    raise ValueError("No Place element found in the WTML file")
root.remove(place)

image_width_arcmin = 13 / 60 # degrees
pixScale = image_width_arcmin / width


for i in range(0, 49):
    new_place = ET.fromstring(ET.tostring(place))
    new_place.set("Dec", str(0.0))
    new_place.set("RA", str(0.0))
    new_place.set('Name', f"Frame {i}")
    new_place.set('Constellation', 'SCL')
    
    
    image_set = new_place.find('ForegroundImageSet/ImageSet')
    if image_set is None:
        raise ValueError("No Imageset element found in the template WTML file")
    url = image_set.get('Url')
    if url is None:
        raise ValueError("No Url attribute found in the template imageset element")
    new_url = url.replace("frame_100.png", f"frame_{100+i}.png")
    image_set.set('Url', new_url)
    image_set.set('Name', f"Frame {i}")
    image_set.set('CenterX', str(0.0))
    image_set.set('CenterY', str(0.0))
    
    image_set.set('OffsetX', str(width / 2))
    image_set.set('OffsetY', str(height / 2))
    image_set.set('BaseDegreesPerTile', str(pixScale))
    root.append(new_place)

tree.write('simulation_all.wtml')




file = Path('./template.wtml')

tree = ET.parse(file)

root = tree.getroot()
place = root.find('Place')
if place is None:
    raise ValueError("No Place element found in the WTML file")
root.remove(place)


image_width_arcmin = 13 / 60 # degrees
pixScale = image_width_arcmin / width




new_place = ET.fromstring(ET.tostring(place))
new_place.set("Dec", str(0.0))
new_place.set("RA", str(0.0))
new_place.set('Name', f"BACKING")
new_place.set('Constellation', 'PIC')

image_set = new_place.find('ForegroundImageSet/ImageSet')
if image_set is None:
        raise ValueError("No Imageset element found in the template WTML file")
image_set.set('Url', "./backing.png")
image_set.set('Name', f"BACKING")
image_set.set('CenterX', str(0.0))
image_set.set('CenterY', str(0.0))

image_set.set('OffsetX', str(width / 2))
image_set.set('OffsetY', str(height / 2))
image_set.set('BaseDegreesPerTile', str(pixScale))
root.append(new_place)

tree.write('simulation_backing.wtml')