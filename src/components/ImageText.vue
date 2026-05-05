<template>
  <div class="image-text">
    <article
      v-if="which === 'Infrared Stars & Dust (JWST)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        JWST NIRCAM + MIRI <br /> The Dust and Stars
      </h3>

      <p>
        This JWST image combines two kinds of infrared light from two different cameras.
        NIRCam, the <b>N</b>ear-<b>I</b>nfra<b>R</b>ed <b>C</b>amera, reveals stars that are easier to see through the
        dust, while MIRI, the <b>M</b>id-<b>I</b>nfra<b>R</b>ed <b>I</b>mager, shows glowing dust along the galaxy's
        spiral arms.
      </p>

      <p>
        The colors are not what human eyes would see. They are assigned to different infrared filters. Blue traces the
        light of old stars and hot gas across the galaxy, while the orange and red hues come from light emitted mainly
        by warm dust and gas from which stars are forming deep inside.
      </p>

      <Lightbox
        v-if="showImage"
        src="./nircam-annot.png"
        alt="Annotated JWST NIRCam + MIRI image of the Phantom Galaxy (M74)"
      />

      <p>
        The soft blue haze near the center comes from older stars packed into the heart of the Phantom Galaxy. At the
        very center, a clearer, whitish-blue point marks the nuclear star cluster, where millions of evolved stars crowd
        together. Across the galaxy, many of the tiny blue and white points are individual bright old stars and
        clusters.
      </p>

      <p>
        The orange and red colors trace dust and gas spread along the spiral arms. These dusty filaments form a spiny,
        spiral structure across the galaxy, reminiscent of a nautilus shell. Bright orange-red knots mark places where
        stars are still forming inside cocoons of gas and dust. For the first time, dark bubbles show where young stars
        have blown material away, carving holes in the surrounding dust.
      </p>

      <p class="image-text__credit">
        <cite>Credit: NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team</cite>
      </p>
    </article>
    <article
      v-if="which === 'Visible Light (Hubble)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        Hubble Visible Light <br /> “Light & Shadow”
      </h3>

      <p>
        Of the three images shown here, Hubble gives us the view closest to visible light — the kind of light human
        eyes can see.
      </p>

      <p>
        The yellowish center is the blended glow of many older stars. Near the core, the light is so crowded and bright
        that individual objects are no longer distinct. Spiraling outward from the center, dark brown dust lanes cut
        across the galaxy. These dusty lanes block visible starlight, hiding stars and smaller star-forming regions
        behind and within them.
      </p>

      <Lightbox
        v-if="showImage"
        src="./hubble-anot.png"
        alt="Annotated Hubble visible light image of the Phantom Galaxy (M74)"
      />

      <p>
        Blue regions shows young, hot stars that have cleared away much of the gas and dust around them. Pink and red
        patches show glowing hydrogen gas in active star-forming regions, lit up by newly formed massive stars. In this
        image, the galaxy is a play of light and shadow: stars shining, dust blocking, and newborn stars lighting up the
        gas around them.
      </p>

      <p class="image-text__credit">
        <cite>Credit: NASA, ESA, and the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration</cite>
      </p>
    </article>

    <article
      v-if="which === 'Infrared Dust (JWST)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        JWST MIRI <br /> The Dust: Making Shadows Shine
      </h3>

      <p>
        This JWST image uses MIRI, the <b>M</b>id-<b>I</b>nfra<b>R</b>ed <b>I</b>nstrument, to focus on the galaxy's
        dust.
      </p>

      <p>
        In visible light, dust often looks like a shadow because it blocks starlight, as in the Hubble image. But when
        you look with a camera that can detect light deep into the infrared (with “heat vision”), that same dust glows.
      </p>

      <p>
        MIRI reveals a branching pattern of gas and dust winding through the Phantom Galaxy’s spiral arms, along with
        knots, bubbles, and cavities shaped by star formation. The smallest bubbles are created by regions where young
        forming stars are blowing away the gas and dust they formed in, while the largest bubbles are created by the
        stars dying and going supernova!
      </p>
      <Lightbox
        v-if="showImage"
        src="./miri-annot.png"
        alt="Annotated JWST MIRI image of the Phantom Galaxy (M74)"
      />
      <p>
        A lack of star forming gas and dust in the galaxy’s center provides an
        unobstructed view of the center of the star cluster in the center of the galaxy, which appears as a bright point
        surrounded by a blue haze made of an unresolved population of older stars.
      </p>

      <p>
        The colors are not what human eyes would see. Different infrared wavelengths are assigned different colors to
        help us distinguish them. Cyan traces warmest dust which is being heated by evolved stars, the murky
        orangey-greenish-brown hues trace the bulk of the warm dust, and then the red shows the coldest dust and gas
        from which stars are forming deep inside.
      </p>

      <p class="image-text__credit">
        <cite>Credit: ESA/Webb, NASA &amp; CSA, J. Lee and the PHANGS-JWST Team. Acknowledgement: J. Schmidt</cite>
      </p>
    </article>

    <article
      v-if="which === '2011 Infrared Dust (WISE)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        Previously On the Phantom Galaxy &ndash; <br /> 2011 WISE Infrared
      </h3>

      <p>
        This image from 2011, taken by WISE, the <b>W</b>ide-field <b>I</b>nfrared <b>S</b>urvey <b>E</b>xplorer,
        shows an infrared view of the Phantom Galaxy at a similar range of wavelengths as the JWST image.
        The older image shows how mauch of an improvement JWST is over previous infrared telescopes.
      </p>

      <p>
        The colors are not what human eyes would see. Different infrared wavelengths are assigned different colors to
        help us distinguish them. The blue colors show hotter material, dust and gas heated by stars.
        Greens show cooler dust. The red blobs show the coldest material, within which young stars are forming.
        These are the same regions which show up as red in the "Infrared Dust (JWST)" image, thought with considerable
        less detail.
      </p>

      <p>
        Some astronomers call the grand design spiral Messier 74 the "perfect spiral," for its exceptional symmetry. It
        is suspected to have a black hole at its center, with a mass equal to 10,000 suns. It is one of only a handful
        of known black holes with masses intermediate between the relatively smaller ones that form from collapsing
        stars and the supermassive black holes millions of times more massive than the sun. Supermassive black holes are
        more typically found at the centers of galaxies. Messier 74 is located between 24.5 and 36 million light-years
        away in the constellation Pisces, and is 100,000 light-years across.
      </p>

      <p class="image-text__credit">
        <cite>Credit: NASA/JPL-Caltech/UCLA</cite>
      </p>
    </article>

    <article
      v-if="which === 'Optical (Kitt Peak)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        Kitt Peak Optical Image
      </h3>

      <p>
        This optical image was taken at Kitt Peak with the Visitor Center's 0.5 meter telescope.
        M74 is one of the dimmer galaxies in the Messier catalogue.
        The galaxy is estimated to be 35 million light years away and about the same size as our own galaxy (100,000
        light years across).
        Many bright pink spots line the blue spiral arms.
        These pink regions are the stellar nurseries from which the bright blue stars in the spiral arms are born.
      </p>

      <p class="image-text__credit">
        <cite>Credit: KPNO/NOIRLab/NSF/AURA/Paul Mortfield and Deitmar Kupke/Flynn Haase</cite>
      </p>
    </article>


    <article
      v-if="which === 'simulation'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        Simulating a Phantom
      </h3>

      <p>
        Telescopes can only show us galaxies at a single moment in time, like a snapshot. To understand how galaxies
        form and change over millions of years, scientists use computer simulations. By comparing these simulations to
        real galaxies, they can better understand what physical processes are at work.
      </p>
      <p>
        In this case, scientists are trying to figure out what causes the bubble shapes seen in infrared images of the
        Phantom Galaxy. The simulation shown here is made up of more than five million individual grid pieces and
        required 224 processors running simultaneously on a powerful supercomputer at Harvard University. The red colors
        represent emission from dust which would be visible to JWST (at 7.7 microns) and the blue shows starlight. While
        it is one of the most detailed galaxy simulations ever made, scientists are always working to make future
        simulations even more realistic.
      </p>

      <p class="image-text__credit">
        <cite>Credit: Scott Lucchini</cite>
      </p>
    </article>



    <article
      v-if="which === '2023 Infrared (Spitzer)'"
      class="image-text__text"
    >
      <h3 v-show="showHeading">
        Previously On the Phantom Galaxy &ndash; <br /> 2023 Spitzer Infrared
      </h3>

      <p>
        Messier 74, also known as the Phantom Galaxy, is seen here in infrared light which showcases its sweeping spiral
        arms and star-forming regions. This image was created using archival data from NASA's Spitzer Space Telescope,
        revealing dust clouds that, in visible light, appear dark.
      </p>

      <p>
        Messier 74 is an archetype of the "grand design" spiral galaxy and is nearly face-on to our view, providing a
        perfect view of its structure. In this infrared image, the light from stars appears blue, as stars are brightest
        at shorter wavelengths of infrared light and less visible at longer wavelengths.
      </p>

      <p>
        Filamentary dust clouds are a feature of spiral arms, and help to trace regions where gas reaches higher
        densities
        and can lead to the formation of stars. These clouds light up at longer wavelengths of light, appearing as pale
        yellow filaments. Regions of newly-forming stars show up as bright red dots scattered along the arms, as they
        glow
        most brightly at the longest infrared wavelengths in this image.
      </p>

      <p>
        The galaxy is located in the Pisces constellation and is situated about 30 million light-years away. It has a
        visible diameter of approximately 10 arc minutes, which is about a third as wide as the full moon. However, its
        low surface brightness makes it too faint to be seen with the naked eye and makes it a challenging target even
        for small backyard telescopes.
      </p>

      <p>
        In this image, infrared light at wavelengths of 3.6, 4.5, and 8.0 microns from Spitzer’s IRAC instrument is
        displayed as blue, cyan, and green, respectively, while light from Spitzer’s MIPS instrument at 24 microns is
        shown in red.
      </p>

      <p class="image-text__credit">
        <cite>Image &amp; Text Credit: ASA/JPL-Caltech</cite>
      </p>
    </article>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';
import type { PhantomImageNames } from '../types';
import Lightbox from './Lightbox.vue';
defineProps({
  which: {
    type: String as PropType<PhantomImageNames>,
    required: true,
  },
  showHeading: {
    type: Boolean,
    default: false,
  },
  showImage: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="less">
@import url('https://fonts.googleapis.com/css2?family=Mulish&display=swap');

.image-text__text h3 {
  font-size: 1.1em !important;
}

.image-text__text p {
  margin-top: 1em;
  text-indent: 15px;
  line-height: 1.5;
  font-family: 'Mulish', sans-serif !important;
}

.image-text__text b {
  color: white;
}

.image-text__credit {
  margin-top: 2em;
  font-size: 0.75em;
  color: rgb(170, 170, 170);
  text-indent: 0;
}
</style>