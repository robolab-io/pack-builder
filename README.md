# pack-builder
Opensource utility to build/convert soundpacks for MechaKeys et al.

<br/>

<table>
  <tr>
    <th colspan="2"> Pack Features </th>
  </tr>
  
  <tr>
    <td>Enhnced</td>
    <td> Per-key attributes, including but not limmited to: <br/> Probability, pitch, volume, stereo, loop, type-rate, simultaneous, delay, etc. </td>
  </tr>
  
  <tr>
    <td>Bi-Directional</td>
    <td> Is capable of assigning sounds to both press and release </td>
  </tr>
  
  <tr>
    <td> Per-Key <br/> Audio </td>
    <td> Can assign audio to individual keys </td>
  </tr>
  
  <tr>
    <td>Multi-Key <br/> Audio</td>
    <td> Can assign multiple sound-bites to a single key </td>
  </tr>
  
  <!--<tr>
    <td>Regex Matching</td>
    <td> Use regex to match keys  </td>
  </tr>-->
  
  <tr>
    <td>Mouse</td>
    <td> Can detect and assign sounds to clicks </td>
  </tr>
</table>

<br/>

## Compatability:

This repo is capable of importing soundpacks from all the following:
> MechaKeys, KeyTao, Mechvibes, Mechvibes++, Modelm, and RustyVibes
<br/>
However, exports may be limited due to feature imparity:

<table>
  <tr>
    <th></th>
    <th>Enhnced</th>
    <th>Bi-Directional <br/> keys</th>
    <th>Per-Key <br/> Audio</th>
    <th>Multi-Key <br/> Audio</th>
    <!--<th>Regex <br/> Matching</th>-->
    <th>Mouse</th>
    <th>Export Type</th>
  </tr>
  
  <tr align="center">
    <td><a href="https://v2.robolab.io/">   MechaKeys   </a></td>
    <td>✅</td>   <td>✅</td>   <td>✅</td>   <td>✅</td>   <!--<td>✅</td>-->   <td>✅</td>
    <td align="left">Folders (optional config.json)</td>
  </tr>
  
  <tr align="center">
    <td><a href="https://github.com/robolab-io/KeyTau">   KeyTao <br> (FOSITE)   </a></td>
    <td>✅</td>   <td>✅</td>   <td>✅</td>   <td>✅</td>   <!--<td>✅</td>-->   <td>✅</td>
    <td align="left">Folders (optional config.json)</td>
  </tr>
  
  <tr align="center">
    <td><a href="https://github.com/millerjs/modelm">   Modelm   </a></td>
    <td>❌</td>   <td>✅</td>   <td>✅</td>   <td>✅</td>   <!--<td>✅</td>-->   <td>❌</td>
    <td align="left">Files + config.yaml</td>
  </tr>
  
  <tr align="center">
    <td><a href="https://github.com/PyroCalzone/MechVibesPlusPlus">   Mechvibes++   </a></td>
    <td>❌</td>   <td>✅</td>   <td>✅</td>   <td>❌</td>   <!--<td>❌</td>-->   <td>❌</td>
    <td align="left">Files + config.json</td>
  </tr>
  
  <tr align="center">
    <td><a href="https://github.com/hainguyents13/mechvibes">   Mechvibes   </a></td>
    <td>❌</td>   <td>❌</td>   <td>✅</td>   <td>❌</td>   <!--<td>❌</td>-->   <td>❌</td>
    <td align="left">File(s) + config.json</td>
  </tr>
  
  <tr align="center">
    <td><a href="https://github.com/KunalBagaria/rustyvibes">   RustyVibes   </a></td>
    <td>❌</td>   <td>❌</td>   <td>✅</td>   <td>❌</td>   <!--<td>❌</td>-->   <td>❌</td>
    <td align="left">Files + config.json</td>
  </tr>
</table>

<br/>

## Others Utils

- [packfixer-rustyvibes](https://github.com/KunalBagaria/packfixer-rustyvibes)
