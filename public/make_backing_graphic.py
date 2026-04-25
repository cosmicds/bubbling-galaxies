import os
from PIL import Image, ImageFont, ImageDraw
import numpy as np

template_frame = Image.open("./simulation_a_pngs/frame_100.png")

size = template_frame.size # (w, h), 0,0 is upper left

BORDER_WIDTH = 5 # pixel

PADDING = 0 # pixel


def write_border(_size, width, rgb):
    (w, h) = _size
    a = np.zeros((h, w, 4), dtype=np.uint8)
    a[:, :, 3] = 255
    a[:, :, 0:3] = rgb
    a[width:-width, width:-width, 3] = 0 # Set inner area to fully transparent
    im = Image.fromarray(a, mode="RGBA")
    return im
    
im = write_border(size, BORDER_WIDTH, (255,255,255))

draw = ImageDraw.Draw(im)
font = ImageFont.load_default(48)
text = "Simulation"
draw.text((BORDER_WIDTH + 10 +  PADDING // 2, BORDER_WIDTH + 10 + PADDING // 2), text, font=font, fill=(255,255,255))

# flip immage left-right
im = im.transpose(Image.FLIP_LEFT_RIGHT)

# # merge frame0 smack in them middle
# frame0 = Image.open("./simulation_a_pngs/frame_100.png")
# im.paste(frame0, (BORDER_WIDTH + PADDING, BORDER_WIDTH + PADDING), frame0)
im.save("./backing.png")