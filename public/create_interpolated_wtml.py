import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
from math import pi

im = Image.open(Path('../../../data_repo/NGC628_interpolated/frames_256/frame_026.png'))
width, height = im.size

file = Path('./template.wtml')

base_url = "https://raw.githubusercontent.com/johnarban/data_repo/refs/heads/main/NGC628_interpolated/frames_256/{frame:s}.png"


def create_new_tree(file_path: Path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    place = root.find('Place')
    if place is None:
        raise ValueError("No Place element found in the WTML file")
    root.remove(place)
    return tree, root, place


def create_new_place(place, name: str, constellation: str, url: str, width: int, height: int, pix_scale: float):
    new_place = ET.fromstring(ET.tostring(place))
    new_place.set("Dec", str(0.0))
    new_place.set("RA", str(0.0))
    new_place.set('Name', name)
    new_place.set('Constellation', constellation)

    image_set = new_place.find('ForegroundImageSet/ImageSet')
    if image_set is None:
        raise ValueError("No Imageset element found in the template WTML file")
    image_set.set('Url', url)
    image_set.set('Name', name)
    image_set.set('CenterX', str(0.0))
    image_set.set('CenterY', str(0.0))
    image_set.set('OffsetX', str(width / 2))
    image_set.set('OffsetY', str(height / 2))
    image_set.set('BaseDegreesPerTile', str(pix_scale))
    return new_place


image_width_kpc = 30 * 1024 / 1168  # kpc
angular_size_distances = 9.4  # Mpc
image_width_degree = (image_width_kpc / (angular_size_distances * 1e3)) * (180 / pi)
pix_scale_sim = image_width_degree / width

print(f"Image width (pixels): {width}")
print(f"Image height (pixels): {height}")
print(f"Image width (kpc): {image_width_kpc}")
print(f"Angular size distance (Mpc): {angular_size_distances}")
print(f"Image width (degree): {image_width_degree}")
print(f"Pixel scale (degree/pixel): {pix_scale_sim}")

tree, root, place = create_new_tree(file)
for i in range(20, 1019, 2):
    url = base_url.format(frame=f"frame_{i:03d}")
    root.append(create_new_place(place, f"Frame {i}", 'SCL', url, width, height, pix_scale_sim))
tree.write('interpolated_simulation_every_5.wtml')
