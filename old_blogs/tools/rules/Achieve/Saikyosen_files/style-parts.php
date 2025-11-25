@charset "UTF-8";


/* 共通 */
.clr {clear: both;}
.bld {font-weight: bold;}
.waku {border: 1px solid #CCC;}
.txtcenter {text-align: center;}
.txtleft {text-align: left;}
.txtright {text-align: right;}
.corner-all-5 {-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;}


/* パーツ01 */
.exp {margin: 5px 10px;}
ul.part01 {margin: 10px; padding: 10px 15px; border: 10px solid rgba(0,191,255,.15); 
	font-size: 1.077em; font-weight: bold; color: #444; -webkit-border-radius: 8px;border-radius: 8px;}
  ul.part01 {background-color: #FFF; }
  .part01 > li {position: relative; margin: 8px 0 8px 2em; padding-left: 0; clear:both; text-align: justify; text-justify: inter-ideograph;}
  ul.part01{background-color: rgba(0,191,255,.02); }
  .part01 > li:before {position: absolute; left: -1.1em; top: .03em; font-family: 'FontAwesome'; content: '\f058';font-size: 1.1em;  color: #00bfff; vertical-align: top;}


/* パーツ02 */
.part02 {letter-spacing: -.4em;}
.part02-inner { display: inline-block; vertical-align: top; width: 50%; margin: 0 0 10px; padding: 0 5px; letter-spacing: 0; overflow: hidden;}
.part02-block {position: relative; border: 3px solid #21c0fc; -webkit-border-radius: 5px;border-radius: 5px;}
.part02-block .inner{padding: 5px; font-size: 0.9em; line-height: 1.4em; text-align: justify; text-justify: inter-ideograph;}
.part02-block .idx {margin-bottom: 5px; padding: 6px 10px; line-height: 1.2em; font-size: 1.077em; font-weight: bold; color: #FFF; background: #21c0fc;}
.part02-block .inner .img-set {max-width: 120px; float: left; margin-right: 10px; border: 1px solid #CCC; overflow: hidden;} 
.part02-block .slink {position: absolute; right: 8px; bottom: 8px; font-size: 1.08em; font-weight: bold; text-align: right;}
.part02-block .slink:before {font-family: 'FontAwesome'; content: '\f0a9'; color: #21c0fc; vertical-align: top; font-size: 1.1em; padding-right: 5px;}


/* パーツ03 */
  .part03 {position: relative; margin: 0 0.5em 10px; border: 3px solid #21c0fc;  padding: 20px 10px 10px 100px;  -webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px; background: #FFFFEC;}
.part03 .pnum{position: absolute; left: 20px; top: 25px; width: 60px; height: 60px; text-align: center; line-height: 60px; background: #21c0fc;
	font-family: 'Arial Black'; font-size: 40px; color: #FFF; z-index: 10;
	-webkit-border-radius: 30px;-moz-border-radius: 30px;border-radius: 30px;}
.part03 .pt { position: absolute; left: 25px; top: 15px; font-family: 'Arial Black'; font-size: 1.539em; color: #21c0fc; z-index: 20;
	text-shadow: #FFF 2px 2px 0px, #FFF -2px 2px 0px, #FFF 2px -2px 0px, #FFF -2px -2px 0px;}
.part03 .idx{font-size: 1.6em; font-weight: bold; line-height: 1.3em; color: #21c0fc;}
.part03 .exp {margin: 0; padding-top: 0.5em; font-size: 1.0em; border-top: 1px dotted #21c0fc;}
/*  パーツ03 ボタン部分  */
.part03_button {text-align: center; display: block; margin: 30px auto;}
.part03_button a{padding: 10px 3em; background-color: rgba(33,192,252, 0.7); border: 2px solid #21c0fc; color: #FFF; font-weight: 600; font-size: 1.15em; line-height: 1.5em; margin: 0 auto; 
   -webkit-border-radius: 8px;-moz-border-radius: 8px;border-radius: 8px;
  -moz-box-shadow:0px 1px 3px rgba(000,000,000,0.5),inset 0px 0px 1px rgba(255,255,255,0.7);
  -webkit-box-shadow:0px 1px 3px rgba(000,000,000,0.5),	inset 0px 0px 1px rgba(255,255,255,0.7);
  box-shadow:	0px 1px 3px rgba(000,000,000,0.5),	inset 0px 0px 1px rgba(255,255,255,0.7);}
.part03_button a:before{content: '＞'; font-weight: bold; padding-right: 5px;}
.part03_button a:hover { background-color: #FFF; 	color: #21c0fc; text-decoration: none;}


/* パーツ04 */
.part04 {margin: 5px 0.5em; padding: 10px; border: 10px solid #EEE; color: #000; -webkit-border-radius: 8px;-moz-border-radius: 8px;border-radius: 8px; background: #EAF9FE;}
.part04 .img-set {max-width: 180px; border: 1px solid #CCC; overflow: hidden;}
.part04 .img-set img {max-width: 100%);}
.part04 .idx01{font-size: 1.23em; font-weight: bold; line-height: 1.4em; color: #444;}
.part04 .idx02{padding: 6px 0; font-size: 1.385em; font-weight: bold; line-height: 1.4em; color: #21c0fc;}
.part04 p {font-size: 0.923em; line-height: 1.4em; text-align: justify; text-justify: inter-ideograph;}


/* パーツ05 */
.part05 { margin: 30px 0.5em 0; padding: 15px;  border: 3px solid #21c0fc; background-color: #FFFFEC; -webkit-border-radius: 8px;-moz-border-radius: 8px;border-radius: 8px;}
.part05 .hdx { margin: -35px 0 10px -10px; background-color: #21c0fc; width: 190px; height: 36px; line-height: 36px; font-size: 1.538em; font-weight: bold; color: #FFF; text-align: center; 
  -webkit-border-radius: 30px 4px 30px 4px; -moz-border-radius: 30px 4px 30px 4px;  border-radius: 30px 4px 30px 4px; }
.part05 .img-set {max-width: 180px; border: 1px solid #CCC; overflow: hidden;}
.part05 .img-set img {max-width: 100%;}
.part05 .idx{margin-bottom: 15px; font-size: 1.538em;font-weight: bold; color: #21c0fc;}
.part05 p {font-size: 0.923em; line-height: 1.4em; text-align: justify; text-justify: inter-ideograph;}
.part05 .slink {margin: 10px 0; font-size: 1.23em; font-weight: bold; text-align: right;}
.part05 .slink:before {font-family: 'FontAwesome'; content: '\f101'; color: #21c0fc; vertical-align: top; padding-right: 5px;}


 /* パーツ06 */
.part06 {margin: 20px 0.5em 0; position: relative; background-color: rgba(33,192,252, 0.2); padding: 80px 5px 5px; -webkit-border-radius: 8px;-moz-border-radius: 8px;border-radius: 8px;}
.part06 .matome {position: absolute; top: 20px; left: 5px; font-size: 20px; font-weight: bold; color: #FFF; z-index: 98;
	text-shadow: 2px 2px 1px #21c0fc; display: block;}
.part06 .icon:before{font-family: 'FontAwesome'; content: '\f058'; font-size: 80px; color: #21c0fc; position: absolute; top: 20px; left: 10px; z-index: 97;}
.part06 .line { margin: -18px 10px 10px 40px; height: 2px; border-bottom: 2px solid #21c0fc;}
.part06 .idx { position: absolute; top: 10px; left: 90px; height: 48px; line-height: 48px; padding-right: 1em;}
.part06 .idx .target{ display:inline-block; vertical-align: middle; font-size: 20px; line-height: 24px; font-weight: bold; color: #21c0fc;}
.part06 .inner {margin: 5px;  padding: 10px; background: #FFF; font-size: 1em; line-height: 1.6em; text-align: justify; text-justify: inter-ideograph;}
.part06 .img-set {max-width: 200px; border: 1px solid #CCC; overflow: hidden;}
.part06 .img-set img {max-width: 100%;}
.part06 .slink {margin: 5px 0; font-size: 1.23em; font-weight: bold; text-align: right;}
.part06 .slink:before {font-family: 'FontAwesome'; content: '\f0a9'; color: #21c0fc; vertical-align: top; font-size: 1.08em; padding-right: 5px;}

 /* パーツ07 */
ul.tabnav{margin: 0; margin-left: calc(50% - 100%/2); padding: 0; list-style: none;}
.tabnav li { display: inline; margin: 0 1px 0 0;}
.tabnav li a{ display: inline-block; background: #FFF; font-size: 0.92em; color: #444444; padding: 4px 10px;	text-decoration: none; border-width: 2px 2px 0 2px; border-style: solid;  border-color: #EFEFEF;
	-moz-border-radius-topleft: 5px;-moz-border-radius-topright:5px;-webkit-border-top-left-radius:5px;-webkit-border-top-right-radius:5px; border-radius: 5px 5px 0px 0px;
	-webkit-box-sizing : border-box ; -moz-box-sizing : border-box ; box-sizing : border-box ;}
.tabnav li.tab01 a { background: #ffffeb; color:#444444}
.tabnav li.tab02 a { background: #dbf1ff; color:#444444}
.tabnav li.tab03 a { background: #d7fbe8; color:#444444}
.tabnav li.tab04 a { background: #ffe5e5; color:#444444}
.tabnav li a:hover {background-color: #C06; color: #FFF;}
#tabcontent {margin: 0; margin-left: calc(50% - 100%/2); width: 100%; overflow-x: hidden ; overflow-y: auto; height: auto; font-size: 1.0em; border: 2px solid #EFEFEF; margin-bottom: 20px;
  -moz-border-radius-topright: 5px;-moz-border-radius-bottomright:5px; -moz-border-radius-bottomleft:5px; -webkit-border-top-right-radius:5px;-webkit-border-botom-right-radius:5px; -webkit-border-botom-left-radius:5px; border-radius: 0px 5px 5px 5px;} 
#tabcontent .tab01 {display: block; background: #FFF; border: 3px solid #ffffeb; padding: 1em;}
#tabcontent .tab02 {display: block; background: #FFF; border: 3px solid #dbf1ff; padding: 1em;}
#tabcontent .tab03 {display: block; background: #FFF; border: 3px solid #d7fbe8; padding: 1em;}
#tabcontent .tab04 {display: block; background: #FFF; border: 3px solid #ffe5e5; padding: 1em;}

 
/* ------ ～479px ------ */
@media screen and (max-width: 479px) {
  /* パーツ01 */
  ul.part01 {width: 100%; margin: 10px 0; padding: 0.5em  0.5em 0.5em 1.5em; background: #FFF;}
  .part01 > li { margin: 8px 0; padding-right: 0;}
  /* パーツ02 */
  .part02-inner { width: 100%; padding: 0;}
  /* パーツ03 */
  .part03 .idx{font-size: 1.2em;}
  .part03 {width: 100%; margin: 0 0 10px 0; padding: 20px 10px 10px 100px; background: #FFFFEC;}
  /* パーツ04 */
  .part04  {width: 100%; margin: 5px 0;}
  .part04 .img-set {max-width: 100%; margin-bottom: 10px;}
  .part04 img {max-width: 100%;}
  /* パーツ05 */
  .part05 {width: 100%; margin: 30px 0 0;}
  .part05 .img-set {max-width: 100%; margin-bottom: 10px;}
  .part05 img {max-width: 100%;}
  /* パーツ06 */
  .part06 .idx .target{ font-size: 15px; line-height: 16px; font-weight: bold; color: #21c0fc;}
  .part06 {width: 100%; margin: 20px 0 0;}
  .part06 .img-set {max-width: 100%; margin-bottom: 10px;}
  /* パーツ07 */
  ul.tabnav {margin: 0;}
  #tabcontent {margin: 0; width: 100%;}
}

