# Artemis II

This repository contains the code for an interactive visualizing the path of NASA's [Artemis II](https://en.wikipedia.org/wiki/Artemis_II) mission using [WorldWide Telescope](https://www.worldwidetelescope.org/home/) (WWT). This interactive is built using WWT's [Vue](https://vuejs.org/) component.

## Developer setup 

To start creating your own data story, you can use the following steps.

* First, clone the repository, 
```
git clone https://github.com/cosmicds/artemis-ii.git
```

If you don't already have yarn installed on your system, do that using the instructions [here](https://yarnpkg.com/getting-started/install). We're using Yarn 4.12.0 for this project.

Install any needed dependencies:
```
yarn
```

* That's it!
    - To preview the story using the development server, run `yarn dev`
    - To build the story for production use, run `yarn build`

### Notes

This interactive modifies the WWT render loop, and in particular adjusts some of the 3D drawing functionality. As the class that serves as the primary handle for 3D planet-drawing methods in WWT is not exported from the core WWT web engine JavaScript package, we have a small `patch.sh` script that injects that import into the built web engine file.

## Deployment and Github Actions

The built story is just a set of HTML/CSS/JS + assets, so it should be easy to host anywhere. For the purposes of this interactive, we're using GitHub Pages. This repository contains two workflows (see the `.github/workflows` directory) to help with this:
* `build.yml` - on a pull request, build the PR version of the story (to test that it at least builds successfully)
* `build-deploy.yml` - on a commit to main, build the story and push the built version to the `gh-pages` branch. This built version is automatically deployed to GitHub Pages due to the repository settings.
