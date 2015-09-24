<h1>Project - 2d graphic editor</h1>

<p>Idea of the project is simple interactive 2D editor.</p>
 
<h2>Project description:</h2>
<p>
Application allows user draw circles using clicks of mouse. The radius of each circle is 2 centimeters. The UI is made of two buttons on the screen with label Left and Right. User can pan the screen (i.e. the coordinates should not change). The units used are in centimeters and the sizes should be roughly according to a 15" display. This should be written using HTML5 and plain Javascript.
</p>

<p>
A simple indicator on the page shows whether the area used by the union of all the circles form one compound shape or more than one. For example if two spheres are far from each other, the number of components is 2. If they have an overlap, the number of components for their collision graph is 1. If multiple circles have two-by-two overlap (like rings of a chain), the the number of components will be one.
</p>

<p> User should be able to export the resulting shape in JSON</p>
 
<p>The first circle is in Red and the rest are in Black. If two circles collide, their colour will be the same (i.e. the Red colour leaks into the black ones touching it). If one of them is Red then both colliding circles will be Red. Otherwise, each circle has its original colour (i.e. black for most colours). The original colour of each circle is black for all except for the first circle. The colours are updated.</p>