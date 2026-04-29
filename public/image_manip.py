import os
import shutil
from pathlib import Path
import tqdm


if shutil.which('magick') is None or shutil.which('mogrify') is None:
    raise SystemExit(
        'ImageMagick is not installed or not on PATH. '
        'Please install ImageMagick before running this script.'
        'On a mac with Homebrew, you can run: brew install imagemagick'
    )

path = Path('./simulation_a_pngs')

pngs = path.glob('*.png')

for png in tqdm.tqdm(list(pngs)):
    # trim white border from png
    os.system(f'mogrify -trim {png}')
    # black to alpha
    os.system(f'magick {png} -transparent "rgba(0, 0, 3)" {png}')
