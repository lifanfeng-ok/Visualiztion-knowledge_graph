(function(){ 
  document.addEventListener('DOMContentLoaded', function(){

    /** Utility functions **/
    let $ = selector => document.querySelector( selector );  // to select HTML elements

    let tryPromise = fn => Promise.resolve().then( fn );  // to start executing a chain of functions

    let toJson = obj => obj.json();  // Convert json file content to javascript object
	
	let resizeCanvas = () => {    // get current browser window size, and fit canvas size to it
	  let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      let canvasHeight = '600px'   // minimun height (800px)
      let canvasWidth = '800px'    // minimum width (1150px)
	  if  (h > 600) {canvasHeight = h + 'px'}
	  if  (w-160 > 800) {canvasWidth = (w-160) + 'px' }
	  // console.log('canvasHeight: ', canvasHeight)
	  // console.log('canvasWidth: ', canvasWidth)
	  $('#canvasWithMenu').style.height = canvasHeight
	  $('#canvasWithMenu').style.width = canvasWidth
	}
	resizeCanvas()

    let cy;  // cytoscape display canvas

    /* For retrieving cytoscape stylesheet stored in separate json file */
	/* not used
    let getStylesheet = name => {
      return fetch(`stylesheets/${name}`).then( res => toJson(res) );
    };
	let applyStylesheet = stylesheet => {
      cy.style().fromJson( stylesheet ).update();
    };
    let applyStylesheetFromSelect = () => Promise.resolve( 'style.default.json' ).then( getStylesheet ).then( applyStylesheet );
    */

    /** Handling of the popup modal windows **/
    $("#modal1").style.display = "block";  // Display the modal

    // When the user clicks on <span> (x), close the modal
    $("#close1").addEventListener('click', function() { $("#modal1").style.display = "none" });
    $("#modal1").addEventListener('click', function() { $("#modal1").style.display = "none" });

    // When the user clicks anywhere outside of modal1, close it
    window.onclick = function(event) {
      if (event.target == $("#modal1")) {
         $("#modal1").style.display = "none";
      }
    }  
	
    // Close graph popup info box, when user double-clicks on it
    $("#graph-popup1-close").addEventListener('click', function() { $("#graph-popup1").style.display = "none" });
    $("#graph-popup1").addEventListener('dblclick', function() { $("#graph-popup1").style.display = "none" });


    /* Make the popup info box draggable */
    	
	dragElement(document.getElementById("graph-popup1"), document.getElementById("graph-popup1-pin") );
    
    function dragElement(elmnt, pinElmnt) {
						
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      elmnt.onmousedown = dragMouseDown;
      elmnt.ontouchstart = dragMouseDown;  // for touch screens

      // The pin element toggles the draggable function on and off 
      pinElmnt.onclick = toggle;
	  // pinElmnt.ontouchstart = toggle;
	  
	  function toggle () {
		if (elmnt.onmousedown != null) { elmnt.onmousedown = null; elmnt.ontouchstart == null }	  
	    else {
          elmnt.onmousedown = dragMouseDown;
          elmnt.ontouchstart = dragMouseDown;  // for touch screens					
		}  
	  }

      function dragMouseDown(e) {
        e = e || window.event;
        // e.preventDefault();
		
		if ((e.clientX)&&(e.clientY)) {
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag_mouse;

        } else if (e.targetTouches) {
          pos3 = e.targetTouches[0].clientX;
          pos4 = e.targetTouches[0].clientY;
		  document.ontouchend = closeDragElement;
          // call a function whenever the cursor moves:
          document.ontouchmove = elementDrag_touch;
        }
      }

      function elementDrag_mouse(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function elementDrag_touch(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.targetTouches[0].clientX;
        pos2 = pos4 - e.targetTouches[0].clientY;
        pos3 = e.targetTouches[0].clientX;
        pos4 = e.targetTouches[0].clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
		document.ontouchend = null;
        document.ontouchmove = null;
      }
    }


    /** Fetch list of songs in the database, and construct drop-down menu **/
    fetch('https://chriskhoo.net/ZS/3/_')
      .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	   })
      .then(records => { 

 	     // construct drop-down menu
         let txt = '<option value="Majulah_Singapura-Work">Select song</option>'
         // display records in table rows
         for (x in records) {
           txt += `<option value="${records[x]._fields[0].properties.id}">${records[x]._fields[0].properties.label}</option>`
         }

         // Display drop-down menu
         document.getElementById("music").innerHTML = txt;
         // document.getElementById("letters").innerHTML = txt;
		 // document.getElementById("commentary").innerHTML = txt;

	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })


    
  /** Listeners & Actions attached to HTML elements **/

  // Song selected from dropdown lists
  $('#music').addEventListener('change', function() { retrieve($('#music').value,'1a','query') });

/* Not currently used
  $('#letters').addEventListener('change', function(){ 
    retrieve($('#letters').value,'1f1','query'); 
	retrieve($('#letters').value,'1f2','query'); 
	retrieve($('#letters').value,'1f3','query'); 
  });
  
  $('#commentary').addEventListener('change', function(){ 
    retrieve($('#commentary').value,'1g1','query'); 
	retrieve($('#commentary').value,'1g2','query'); 
	retrieve($('#commentary').value,'1g3','query'); 
  });
*/

/* Old method, no longer used   
  const song1 = 'Majulah_Singapura-Work'
  const song2 = 'Semoga_Bahagia-Work'

  $('#majulah-music').addEventListener('click', function() { retrieve(song1,'1a','query') });

  $('#majulah-letters').addEventListener('click', function(){ 
    retrieve(song1,'1e1','query'); 
	retrieve(song1,'1e2','query'); 
	retrieve(song1,'1e3','query'); 
  });
	
  $('#semoga-music').addEventListener('click', function() { retrieve(song2,'1a','query') });
	
  $('#semoga-letters').addEventListener('click', function() { 
    retrieve(song2,'1e1','query'); 
	retrieve(song2,'1e2','query'); 
	retrieve(song2,'1e3','query'); 
  });
*/


  $('#social_network').addEventListener('click', function() { 
      retrieve('Zubir_Said','2a1','query');
	  retrieve('Zubir_Said','2a2','query');
	  retrieve('Zubir_Said','2a3','query') ;
  });

  $('#genre-photos').addEventListener('click', function() { retrieve('Photograph','2b','query') });
 
  $('#genre-letters').addEventListener('click', function() { retrieve('Letter','2b','query') });
 
  $('#genre-speeches').addEventListener('click', function() { retrieve('Speech','2b','query') });

  $('#genre-docs').addEventListener('click', function() { retrieve('_','2c','query') });
  
  $('#genre-commentary').addEventListener('click', function() { retrieve('Comment','2b2','query') });

  $('#genre-essays').addEventListener('click', function() { retrieve('Essay','2b','query') });

  $('#genre-news').addEventListener('click', function() { retrieve('NewsArticle','2b','query') });

  $('#genre-tv').addEventListener('click', function() { retrieve('Documentary','2b2','query') });

  $('#genre-all').addEventListener('click', function(){
	  retrieve('_','2d','query');
	  retrieve('_','2c','query');
  });

  $('#topic').addEventListener('click', function() { retrieve('_','2e','query') });

  /* Example */
  // $stylesheet.addEventListener('change', applyStylesheetFromSelect);


 
  /** MAIN FUNCTION **/ 
  // Fetch function submits query to ZS server API (middleware)and retrieve json result
  // Display query parameter in element ID 'query'
  // Runs cytoscape visualization
  async function retrieve(parameter, queryID, elementID_query) {

    // Display TOPIC (query keyword) as page header
    document.getElementById(elementID_query).innerHTML = parameter.toUpperCase().replace(/_/g, ' ')

    // fetch template
    // fetch(url, options).then(response => response.json()).then(result => /* process result */)

    API_domain = 'https://chriskhoo.net'
    API_router = 'ZS'
    API_queryID = queryID
    API_param = parameter
    API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param}`

    fetch(API_string)
      .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	   })
      .then(json_value => { 
	    console.log(json_value);
        if (json_value.length > 0) { 
		  json2graph(json_value)             // add search results to graph
	      cy.layout( layouts['breadthfirst'] ).run() // run default graph layout
		  // cy.panBy({ x: 0, y: -200 })
		}
	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })

  }
  // Notes on response instances returned when fetch() promises are resolved.
  // Most common response properties:
  // Response.status — An integer (default value 200) containing the response status code.
  // Response.statusText — A string (default value ""), which corresponds to the HTTP status code message. Note that HTTP/2 does not support status messages.
  // Response.ok — used above, this is a shorthand for checking that status is in the range 200-299 inclusive. This returns a Boolean.
  
  
 
  /** Add Neo4j result records to Cytoscape graph */
  let json2graph = records => {

    let z_obj;      // to store properties[z] in JSON file from neo4j
	let cy_ele;     // to store newly created graph element 
	
    for (x in records) {  // Process each record

	  /* Process all the node fields first */
      for (y in records[x]._fields) {  // Process each field in record
     
        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null) 
        
	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // the field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // skip for now
		  
        } else {    // field is a NODE, not relation
        
		  // create cytoscape node. Add mandatory fields
          cy.add({ data: {
			id: records[x]._fields[y].identity.low,            
			id2: records[x]._fields[y].properties.id,
			supertype: records[x]._fields[y].labels[0],
            type: records[x]._fields[y].properties.type,
			label: records[x]._fields[y].properties.label,
          }});

          cy_ele = cy.$id(records[x]._fields[y].identity.low) ;  // retrieve newly created node to add more fields

          // add other fields
          for (z in records[x]._fields[y].properties) { 
		    z_obj = records[x]._fields[y].properties[z] ;
		    switch (z) {          // handle dates & URLs
              case 'id': break;   // skip id field as already displayed
		      case 'type': break;   // skip id field as already displayed
		      case 'label': break;   // skip id field as already displayed
			  case 'birthDate':
              case 'deathDate': 
              case 'date': 
			    cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              case 'thumbnailURL':  // array of URLs
			    cy_ele.data( z , z_obj)
                break;
              case 'accessURL':     // array of URLs
			    cy_ele.data( z , z_obj)
			    break;
              default: cy_ele.data( z , JSON.stringify(z_obj).slice(1,-1) ) ;   
            }		  
		  }
		  // console.log(cy_ele.data());
		  
		}
	  }
	  
	  /* Now process all the relations */
      for (y in records[x]._fields) {  // Process each field in record
     
        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null) 
        
	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // Add edge to graph
          cy.add({ data: {
            id: records[x]._fields[y].identity.low + 10000,  // to distinguish edge IDs from node IDs
            source: records[x]._fields[y].start.low,
            target: records[x]._fields[y].end.low,
            type: records[x]._fields[y].type,
			label: records[x]._fields[y].properties.label,
          }});

		  cy_ele = cy.$id(records[x]._fields[y].identity.low + 10000) ;  // retrieve newly created relation to add more fields

          // add other fields
          for (z in records[x]._fields[y].properties) { 
		    z_obj = records[x]._fields[y].properties[z] ;
		    switch (z) {          // handle dates & URLs
              case 'id': break;   // skip id field as already displayed
		      case 'type': break;   // skip id field as already displayed
		      case 'label': break;   // skip id field as already displayed
              case 'date': cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              default: cy_ele.data( z , JSON.stringify(z_obj).slice(1,-1) ) ;   
			}
          }	
		  // console.log(cy_ele.data());		  
        }
      }
    }
  }
 
 
 
  cy = cytoscape({
    
	container: $('#cy'),
	minZoom: 0.5,
    maxZoom: 4,
	
    elements: [ // list of graph elements to start with
    ],

    style: [ // the stylesheet for the graph
      {
        selector : "node",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "180px",
          "background-color" : "hsl(240,80%,90%)",
          "border-width" : 0.0,
          "height" : 30.0,
          "shape" : "ellipse",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "text-opacity" : 1.0,
          "text-valign" : "center",
          "text-halign" : "center",
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "border-opacity" : 0.0,
          "border-color" : "hsl(0,0%,100%)",
          "width" : 50.0,
          "background-opacity" : 1.0,
          "content" : "data(label)"
      }}, 
	  {
        selector : "edge",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "200px",
          "line-style" : "solid",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "line-color" : "hsl(240,80%,70%)",
          "text-opacity" : 1.0,
          "width" : 1.0,
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "opacity" : 1.0,
		  "source-arrow-color" : "hsl(0,0%,100%)",
          "source-arrow-shape" : "none",
		  "target-arrow-shape" : "triangle",
          "target-arrow-color" : "hsl(240,80%,20%)",
		  "target-arrow-fill" : "filled",
		  "arrow-scale" : 1,
          "content" : "data(label)"
      }}, 
	  {
        selector : "node[supertype = 'MusicalWork']",
        style : {
          "shape" : "octagon",
	      "background-color" : "hsl(0, 80%, 90%)",
	      "height" : 50.0,
		  "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(0, 80%, 50%)",
      }}, 
	  {
        selector : "node[supertype = 'Topic']",
        style : {
          "background-color" : "hsl(40, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Person']",
        style : {
          "background-color" : "hsl(80, 80%, 90%)",
	      "shape" : "round-rectangle",
		  "height" : 50.0,
	      "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(80, 80%, 50%)",
          "width" : 40.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "node[supertype='CreativeWork'],[supertype='Document'],[supertype='Information_Object']",
        style : {
          "shape" : "rectangle",
	      "background-color" : "hsl(120, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Place']",
        style : {
	      "background-color" : "hsl(160, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Item']",
        style : {
    	  "background-color" : "hsl(200, 80%, 90%)",
	      "border-width" : 1.0,
          "height" : 20.0,
          "shape" : "ellipse",
          "border-opacity" : 1.0,
          "border-color" : "hsl(200, 50%, 50%)",
          "width" : 20.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "edge[type = 'REALIZATION'],[type = 'PERFORMED_IN'],[type = 'ARRANGEMENT']",
        style : {
          "line-color" : "hsl(0, 100%, 90%)",
	      "width" : 3.0,
       }}, 
	   {
        selector : "edge[type = 'ITEM']",
        style : {
          "line-color" : "hsl(240,80%,50%)",
       }}, 
	   {
        selector : "node[supertype = 'Class']",
        style : {
	      "background-color" : "hsl(280, 60%, 90%)",
          "shape" : "triangle",
        }},
	  {
        selector : "node:selected",
        style : {
          "background-color" : "hsl(280,100%,70%)"
      }}, 
	  {
        selector : "edge:selected",
        style : {
          "line-color" : "hsl(280,100%,30%)",
      }},
      {
        selector : ".selected_node",
        style : {
          "background-color" : "hsl(280,100%,70%)"
      }},
      {
        selector : ".unselected_node",
        style : {
          "color": '#eee',
          "opacity": 0.2
      }},
    ],	  
  });


  let layouts = {
    cola: {
        name: 'cola',
		
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 20000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: false, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

        // layout event callbacks
        ready: function(){}, // on layoutready
        stop: function(){}, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
        nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
        gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: 100, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    },
    breadthfirst: {  	
	    name: 'breadthfirst',

        fit: false, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap). default 1.75
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

    },
    cose: {		  
        name: 'cose',

        ready: function(){},  // Called on `layoutready`
        stop: function(){},   // Called on `layoutstop`

        // Whether to animate while running the layout
        // true : Animate continuously as the layout is running
        // false : Just show the end result
        // 'end' : Animate with the end result, from the initial positions to the end positions
        animate: true,
        animationEasing: undefined,    // Easing of the animation for animate:'end'
        animationDuration: 10000,  // The duration of the animation for animate:'end'

        // A function that determines whether the node should be animated
        // All nodes animated by default on animate enabled
        // Non-animated nodes are positioned immediately when the layout starts
        animateFilter: function ( node, i ){ return true; },

        // The layout animates only after this many milliseconds for animate:true
        // (prevents flashing on fast runs)
        animationThreshold: 250,

        refresh: 20,    // Number of iterations between consecutive screen positions update
        fit: false,    // Whether to fit the network view after when done
        padding: 30,    // Padding on fit
        boundingBox: undefined,    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

        // Excludes the label when calculating node bounding boxes for the layout algorithm
        nodeDimensionsIncludeLabels: false,

        randomize: false,        // Randomize the initial positions of the nodes (true) or use existing positions (false)
        componentSpacing: 40,    // Extra spacing between components in non-compound graphs
        nodeRepulsion: function( node ){ return 2048; },    // Node repulsion (non overlapping) multiplier. Default 2048
        nodeOverlap: 5,          // Node repulsion (overlapping) multiplier. Default 4
        idealEdgeLength: function( edge ){ return 40; },    // Ideal edge (non nested) length
        edgeElasticity: function( edge ){ return 40; },     // Divisor to compute edge forces
        nestingFactor: 1.2,      // Nesting factor (multiplier) to compute ideal edge length for nested edges
        gravity: 1,              // Gravity force (constant)
        numIter: 20000,           // Maximum number of iterations to perform
        initialTemp: 1000,       // Initial temperature (maximum node displacement)
        coolingFactor: 0.99,     // Cooling factor (how the temperature is reduced between consecutive iterations
        minTemp: 1.0             // Lower temperature threshold (below this point the layout will end)
    }, 
	concentric: {
      name: 'concentric',

      fit: false, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      height: undefined, // height of layout area (overrides container height)
      width: undefined, // width of layout area (overrides container width)
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
      },
      levelWidth: function( nodes ){ // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
	fcose: {
      name: 'fcose',
	
      // 'draft', 'default' or 'proof' 
      // - "draft" only applies spectral layout 
      // - "default" improves the quality with incremental layout (fast cooling rate)
      // - "proof" improves the quality with incremental layout (slow cooling rate) 
      quality: "default",
      // Use random node positions at beginning of layout
      // if this is set to false, then quality option must be "proof"
      randomize: true, 
      // Whether or not to animate the layout
      animate: true, 
      // Duration of animation in ms, if enabled
      animationDuration: 1000, 
      // Easing of animation, if enabled
      animationEasing: undefined, 
      // Fit the viewport to the repositioned nodes
      fit: true, 
      // Padding around layout
      padding: 30,
      // Whether to include labels in node dimensions. Valid in "proof" quality
      nodeDimensionsIncludeLabels: false,
      // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
      uniformNodeDimensions: false,
      // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
      packComponents: true,
      // Layout step - all, transformed, enforced, cose - for debug purpose only
      step: "all",
  
      /* spectral layout options */
      // False for random, true for greedy sampling
      samplingType: true,
      // Sample size to construct distance matrix
      sampleSize: 25,
      // Separation amount between nodes
      nodeSeparation: 75,
      // Power iteration tolerance
      piTol: 0.0000001,
  
      /* incremental layout options */
      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: node => 15000,   // default 4500
      // Ideal edge (non nested) length
      idealEdgeLength: edge => 100,   // 50
      // Divisor to compute edge forces
      edgeElasticity: edge => 0.45,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.1,
      // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
      numIter: 2500,
      // For enabling tiling
      tile: true,  
      // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingVertical: 10,
      // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingHorizontal: 10,
      // Gravity force (constant)
      gravity: 0.25,     // 0.25
      // Gravity range (constant) for compounds
      gravityRangeCompound: 1.5,
      // Gravity force (constant) for compounds
      gravityCompound: 1.0,
      // Gravity range (constant)
      gravityRange: 3.8, 
      // Initial cooling factor for incremental layout  
      initialEnergyOnIncremental: 0.3,

      /* constraint options */
      // Fix desired nodes to predefined positions
      // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
      fixedNodeConstraint: undefined,
      // Align desired nodes in vertical/horizontal direction
      // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
      alignmentConstraint: undefined,
      // Place two nodes relatively in vertical/horizontal direction
      // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
      relativePlacementConstraint: undefined,

      /* layout event callbacks */
      ready: () => {}, // on layoutready
      stop: () => {} // on layoutstop	
	},
	dagre: {
      name: 'dagre',
	  
	  // dagre algo options, uses default value on undefined
      nodeSep: undefined, // the separation between adjacent nodes in the same rank
      edgeSep: undefined, // the separation between adjacent edges in the same rank
      rankSep: undefined, // the separation between each rank in the layout
      rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
      ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
      minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
      edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

      // general layout options
      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
      animate: false, // whether to transition the node positions
      animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
      ready: function(){}, // on layoutready
      stop: function(){} // on layoutstop
    },
	spread: {
      name: 'spread',
	  
      animate: true, // Whether to show the layout as it's running
      ready: undefined, // Callback on layoutready
      stop: undefined, // Callback on layoutstop
      fit: true, // Reset viewport to fit default simulationBounds
      minDist: 20, // Minimum distance between nodes
      padding: 20, // Padding
      expandingFactor: -1.0, // If the network does not satisfy the minDist
      // criterium then it expands the network of this amount
      // If it is set to -1.0 the amount of expansion is automatically
      // calculated based on the minDist, the aspect ratio and the
      // number of nodes
      prelayout: { name: 'fcose' }, // Layout options for the first phase
      maxExpandIterations: 4, // Maximum number of expanding iterations
      boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      randomize: false // Uses random initial node positions on true	  
    },
    random: {

      name: 'random',

      fit: true, // whether to fit to viewport
     padding: 30, // fit padding
     boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
    circle: {
              name: 'circle',

  fit: true, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  radius: undefined, // the radius of the circle
  startAngle: 3 / 2 * Math.PI, // where nodes start in radians
  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

    },
    grid: {
         name: 'grid',

  fit: true, // whether to fit the viewport to the graph
  padding: 30, // padding used on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  condense: false, // uses all available space on false, uses minimal space on true
  rows: undefined, // force num of rows in the grid
  cols: undefined, // force num of columns in the grid
  position: function( node ){}, // returns { row, col } for element
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function (node, position ){ return position; }
    }
  };


  /** Listeners & Actions attached to Cytoscape display & elements **/
  
  /* Change graph layout */
  $('#layout-breadthfirst').addEventListener('click', function(){ cy.layout( layouts['breadthfirst'] ).run() });
  $('#layout-fcose').addEventListener('click', function(){ cy.layout( layouts['fcose'] ).run() });
  $('#layout-concentric').addEventListener('click', function(){ cy.layout( layouts['concentric'] ).run() });
  $('#layout-random').addEventListener('click', function(){ cy.layout( layouts['random'] ).run() });
 // $('#layout-spread').addEventListener('click', function(){ cy.layout( layouts['spread'] ).run() });
  $('#Grid').addEventListener('click', function(){ cy.layout( layouts['grid'] ).run() });
  $('#Circle').addEventListener('click', function(){ cy.layout( layouts['circle'] ).run() });

  $('#clear_canvas').addEventListener('click', function(){ cy.elements().remove() });

  $('#reset_zoom').addEventListener('click', function(){ cy.reset();  });

  $('#resizeCanvas').addEventListener('click', function(){ resizeCanvas(); cy.reset();  });
  $('#fullscreen').addEventListener('click', function(){ openFullscreen(); cy.reset();  });


  function openFullscreen() {
    if ($('#canvasWithMenu').requestFullscreen) {
      $('#canvasWithMenu').requestFullscreen();
    } else if ($('#canvasWithMenu').webkitRequestFullscreen) { /* Safari */
      $('#canvasWithMenu').webkitRequestFullscreen();
    } else if ($('#canvasWithMenu').msRequestFullscreen) { /* IE11 */
      $('#canvasWithMenu').msRequestFullscreen();
    }
  }



  /* Respond to clicks on graph nodes & edges */
  cy.on('tap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked

    // console.log( 'tapped ' + node.data() );
	// $('#graph-popup1-content').innerHTML = '<p>' + JSON.stringify(node.data()) + '</p>';

    // html text to display in panel. Start with ID2 field
    let txt = '<p><b>ID: ' + node.data()['id2'] + '</b></p>';  
	txt = txt.replace(/_/g, ' ')   // replace _ with space

    // temporary storage
    let comment_text;  
	let link_text;
	let date_text;
	
    for (x in node.data()) {

      // console.log(x + " : " + node.data()[x])
      
       
        //ID: <a target="_blank" href="?parameter='
        //txt += records[x]._fields[y].properties.id  + '">'   // hyperlink
        //txt += records[x]._fields[y].properties.id.replace(/_/g, ' ') + '</a></b><br/>'  // text
     
      switch (x) {          // handle dates & URLs
        case 'id': break;   // skip id field as it is just a node no. We'll display id2
        case 'id2': break;  // already displayed
		case 'supertype': break;  // skip this field
        case 'comment':
		  if ( node.data()[x] != '' ) {
            comment_text = node.data()[x]
            comment_text = comment_text.replace(/\\n/g, '<br/>')  // replace \\n in the text with <br>
		    comment_text = comment_text.replace(/\\/g, '')        
			comment_text = comment_text.replace(/[‘’“”]/g, '\'')  // replace pretty quotation marks with plain quote
            txt += '<p><em>comment</em>: ' + comment_text + '</p>'
		  }
          break;
        case 'birthDate':
        case 'deathDate':
        case 'date':
          date_text = node.data()[x]
          date_text = date_text.replace('-1-1', '')  // remove Jan 1st, and retain just the year.
		  date_text = date_text.replace('-01-01', '')    	          
          txt += '<p><em>' + x + '</em>: ' + date_text + '</p>'				  
		  break;
        case 'thumbnailURL':  // display thumbnail image
          txt += '<p><a target="_blank" href="' + node.data().accessURL[0]  + '">'
          txt += '<img alt="Photograph" width="200" src="' + node.data().thumbnailURL[0] +'"/></a></p>'
          break;
        case 'accessURL':
          for (link in node.data()[x]) {
              link_URL = node.data().accessURL[link]

                if (link_URL.search("pdf")>=0) { link_text = 'PDF'   // PDF file
                } else if (link_URL.search("jpg")>=0) { link_text = 'JPG' 
                } else if (link_URL.search("youtube")>=0) { link_text = 'YouTube' 
                } else { link_text = 'Webpage' }

                txt += '<p><a href="' + link_URL +'" target="_blank"><b>' + link_text + '</b></a></p>'
          }
          break;
        default: txt += '<p><em>' + x + '</em>: ' + node.data()[x] + '</p>'
      }
    }
	$('#node-expand').value = node.data()['id2'];  // Add neo4j node ID2 to button value - to pass to listener when clicked
	$('#node-remove').value = node.data()['id'];   // Add cytoscape node ID to button value
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'block'; 
	// Create an event for Google Tag Manager trigger
    dataLayer.push({'event': 'graph-node-click'});

     console.log(event);
     cy.elements().removeClass('selected_node');
     cy.elements().removeClass('unselected_node');
     let select_node= cy.$('#'+event.target.id());
     select_node.addClass('selected_node');
     select_node.neighborhood().addClass('selected_node');
     let unselected_nodes = cy.$('.selected_node').absoluteComplement();
     unselected_nodes.addClass('unselected_node');
  });

  cy.on('click', function (e) {
        const tgt = e.target;
        if(tgt === cy) {
            cy.elements().removeClass('selected_node');
            cy.elements().removeClass('unselected_node');
        }
  })

  cy.on('tap', 'edge', function(event){
    let edge = event.target;
    let txt = '<p><b>Relation: ' + edge.data()['type'] + '</b></p>';  // html text to display in panel
	
    for (x in edge.data()) {
     
      switch (x) {          
        case 'id': break;       // skip 
		case 'source': break;   // skip 
		case 'target': break;   // skip 
        case 'type':  break; 
        case 'comment':
          comment_text = edge.data()[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')
		  comment_text = comment_text.replace(/\\/g, '')
		  comment_text = comment_text.replace(/[‘’“”]/g, '\'')		  
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        default: txt += '<p><em>' + x + '</em>: ' + edge.data()[x] + '</p>'
      }
    }
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'none'; 
  });

  /* Expand a node with neighboding nodes, when user rightclicks on a node */
  cy.on('cxttap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked
	node.select();   
    retrieve(node.data()['id2'],'0','query')
	// Create an event for Google Tag Manager trigger
    dataLayer.push({'event': 'graph-node-rightclick'});
  });
 
 
  /* Add listeners for expanding and removing existing Cytoscape nodes */
  // expand node id stored in button value
  $('#node-expand').addEventListener('click', function() { 
    retrieve( $('#node-expand').value, '0', 'query') // $('#node-expand').value contains the node ID used in neo4j database
  });
  // remove node stored in button value
  $('#node-remove').addEventListener('click', function() { 
    cy.$id($('#node-remove').value).remove()                // $('#node-remove').value contains the node ID used in Cytoscape
  });
  $('#remove_photo').addEventListener('click', ()=>{
       cy.remove('node[supertype = "CreativeWork"]');
  })

            
  });
})();

