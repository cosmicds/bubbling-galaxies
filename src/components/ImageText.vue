<template>
  <div class="image-text">
    <div
      v-if="which === 'Infrared Stars & Dust (JWST)'"
      class="image-text__text"
    >
      <h3>JWST NIRCAM + MIRI: The Dust and Stars</h3>

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
    </div>
    <div
      v-if="which === 'Visible Light (Hubble)'"
      class="image-text__text"
    >
      <h3>Hubble Visible Light “Light & Shadow”</h3>

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

      <p>
        Blue regions shows young, hot stars that have cleared away much of the gas and dust around them. Pink and red
        patches show glowing hydrogen gas in active star-forming regions, lit up by newly formed massive stars. In this
        image, the galaxy is a play of light and shadow: stars shining, dust blocking, and newborn stars lighting up the
        gas around them.
      </p>
    </div>

    <div
      v-if="which === 'Infrared Dust (JWST)'"
      class="image-text__text"
    >
      <h3>JWST MIRI - The Dust, Making Shadows Shine</h3>

      <p>
        This JWST image uses MIRI, the <b>M</b>id-<b>I</b>nfra<b>R</b>ed <b>I</b>nstrument, to focus on the galaxy's
        dust.
      </p>

      <p>
        In visible light, dust often looks like a shadow because it blocks starlight, as in the Hubble image. But when
        you look with a camera that can detect light deep into the infrared (with “heat vision”), that same dust glows.
        MIRI reveals a branching pattern of gas and dust winding through the Phantom Galaxy’s spiral arms, along with
        knots, bubbles, and cavities shaped by star formation. The smallest bubbles are created by regions where young
        forming stars are blowing away the gas and dust they formed in, while the largest bubbles are created by the
        stars dying and going supernova! A lack of star forming gas and dust in the galaxy’s center provides an
        unobstructed view of the center of the star cluster in the center of the galaxy, which appears as a bright point
        surrounded by a blue haze made of an unresolved population of older stars.
      </p>

      <p>
        The colors are not what human eyes would see. Different infrared wavelengths are assigned different colors to
        help us distinguish them. Cyan traces warmest dust which is being heated by evolved stars, the murky
        orangey-greenish-brown hues trace the bulk of the warm dust, and then the red shows the coldest dust and gas
        from which stars are forming deep inside.
      </p>
    </div>
    
    <div
      v-if="which === 'Optical (Kitt Peak)'"
      class="image-text__text"
    >
      <h3>JWST MIRI - The Dust, Making Shadows Shine</h3>

      <p>
        This optical image was taken at Kitt Peak with the Visitor Center's 0.5 meter telescope. 
        M74 is one of the dimmer galaxies in the Messier catalogue. 
        The galaxy is estimated to be 35 million light years away and about the same size as our own galaxy (100,000 light years across). 
        Many bright pink spots line the blue spiral arms. 
        These pink regions are the stellar nurseries from which the bright blue stars in the spiral arms are born.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';
import type { PhantomImageNames } from '../types';
defineProps({
  which: {
    type: String as PropType<PhantomImageNames>,
    required: true,
  },
});
</script>
<style lang="less">
.image-text__text h3 {
  display: none;
  color: rgb(230, 230, 230);
}

.image-text__text p {
  margin-top: 1em;
  text-indent: 15px;
  font-size: 0.9em;
  line-height: 1.5;
  color: rgb(230, 230, 230);
}

.image-text__text b {
  color: white;
}
</style>