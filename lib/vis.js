(function(){
  document.addEventListener('DOMContentLoaded', function(){

    /** Utility functions **/
    let $ = selector => document.querySelector( selector );  // to select HTML elements
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
	resizeCanvas();

	let data = {
	    nodes:[],
        edges:[]
    }

    let container = document.getElementById('cy');

	let options = {
	     manipulation: {
	          enabled: true,
              initiallyActive: false,
              addNode: true,
              addEdge: true,
              deleteNode: true,
              deleteEdge: true,
        },
	   edges: {
	      width: 2
       },
       interaction: {
           hover: true,
           hoverConnectedEdges: false,
           selectConnectedEdges: false,
           navigationButtons: true,
           selectable: true,
           tooltipDelay: 300,
           zoomSpeed: 1,
           zoomView: true
       },
     groups: {
         CreativeWork: {
             shape: 'square',
             color: {
                 background: "hsl(120, 80%, 90%)"
             }
         },
         Person: {
              shape: 'dot',
              color: {
                  border: "hsl(80, 80%, 90%)",
                  background: "hsl(80, 80%, 50%)"
              },
         },
         MusicalWork: {
              shape: 'box',
              color:{
                 background : "hsl(0, 80%, 90%)"
              },
              borderWidth: 1
         },
          Topic: {
              color: {
                  background: "hsl(40, 80%, 90%)"
              }
         },
         Place: {
              color: {
                  background: "hsl(160, 80%, 90%)"
              }
         },
         Item: {
             shape: 'ellipse',
             color: {
                 background: "hsl(200, 80%, 90%)"
             }
         },
         Document: {
             shape: 'square',
             color: {
                 background: "hsl(120, 80%, 90%)"
             }
         },
         Information_Object: {
            shape: 'square',
             color: {
                 background: "hsl(120, 80%, 90%)"
             }
         },
         Selected : {
             color: {
                 background: "hsl(200, 80%, 90%)"
             }
         },
         Unselected: {
             opacity: 0.1,
             color: '#eee'
         }
     }
    };
    let network = new vis.Network(container, data, options);
    let newdata;

     /** Handling of the popup modal windows **/
    $("#modal1").style.display = "block";  // Display the modal

    // When the user clicks on <span> (x), close the modal
    $("#close1").addEventListener('click', function() { $("#modal1").style.display = "none" });
    $("#modal1").addEventListener('click', function() { $("#modal1").style.display = "none" });

    // When the user clicks anywhere outside of modal1, close it
    window.onclick = function(event) {
      if (event.target === $("#modal1")) {
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
          console.log(json_value)
        if (json_value.length > 0) {
            newdata = json2graph(json_value)             // add search results to graph
        }
	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })

  }
  // Notes on response instances returned when fetch() promises are resolved.
  // Most common response properties:
  // Response.status — An integer (default value 200) containing the response status code.
  // Response.statusText — A string (default value ""), which corresponds to the HTTP status code message. Note that HTTP/2 does not support status messages.
  // Response.ok — used above, this is a shorthand for checking that status is in the range 200-299 inclusive. This returns a Boolean.

      
   async function expand_node(parameter, queryID, elementID_query) {
      let API_domain = 'https://chriskhoo.net'
      let API_router = 'ZS'
      let API_queryID = queryID
      let API_param = parameter
      let API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param}`

      fetch(API_string)
       .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	    })
       .then(json_value => {
          console.log(json_value)
         if (json_value.length > 0) {
		    newdata = addnode(newdata,json_value)             // add search results to graph
		 }
	    })
       .catch(error => {console.error('Problem with the fetch operation from server API', error) })
    }

   function Title(text) {
         const container = document.createElement('div');
         container.innerText = text;
         return container;
   }

   function handle_data(nodes,edges,records) {
      let z_obj;
      for (x in records) {  // Process each record

	  /* Process all the node fields first */
       for (y in records[x]._fields) {  // Process each field in record

        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null)

	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // the field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // skip for now

        } else {    // field is a NODE, not relation
           has_node = nodes.filter(function (item) {
                return item.id === records[x]._fields[y].identity.low
           })
          if (has_node.length === 0 ) {
              nodes.push({
                      id: records[x]._fields[y].identity.low,
                      id2: records[x]._fields[y].properties.id,
                      group: records[x]._fields[y].labels[0],
                      originalGroup: records[x]._fields[y].labels[0],
                      type: records[x]._fields[y].properties.type,
                      label: records[x]._fields[y].properties.label,
                      title: Title(
                           `${records[x]._fields[y].properties.type}:${records[x]._fields[y].properties.label}
                                  group: ${records[x]._fields[y].labels[0]}
                                  This pop-up will pop up when hovering a node
                           `
                      )
                  }
              )
              let current_node = nodes.filter(function (item) {
                  return item.id === records[x]._fields[y].identity.low
              })[0]
              // add other fields
              for ( let z in records[x]._fields[y].properties) {
                  z_obj = records[x]._fields[y].properties[z];
                  switch (z) {          // handle dates & URLs
                      case 'id':
                          break;   // skip id field as already displayed
                      case 'type':
                          break;   // skip id field as already displayed
                      case 'label':
                          break;   // skip id field as already displayed
                      case 'birthDate':
                      case 'deathDate':
                      case 'date':
                          current_node[z] = z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
                          break;
                      case 'thumbnailURL':  // array of URLs
                          current_node[z] = z_obj
                          break;
                      case 'accessURL':     // array of URLs
                          current_node[z] = z_obj
                          break;
                      default:
                          current_node[z] = JSON.stringify(z_obj).slice(1, -1);
                  }
              }
          }
		}
	  }

	  /* Now process all the relations */
      for (let y in records[x]._fields) {  // Process each field in record

        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null)

	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // Add edge to graph
           has_edge = edges.filter(function (item) {
                return item.id === records[x]._fields[y].identity.low + 10000
           })
           if (has_edge.length === 0) {
               edges.push(
                   {
                       id: records[x]._fields[y].identity.low + 10000,  // to distinguish edge IDs from node IDs
                       from: records[x]._fields[y].start.low,
                       to: records[x]._fields[y].end.low,
                       type: records[x]._fields[y].type,
                       label: records[x]._fields[y].properties.label,
                       original_color: {
                            color: '#483D8B',
                            opacity: 1.0
                        },
                       color: {
                            color: '#483D8B',
                            opacity: 1.0
                        }
                   }
               )
               let current_edge = edges.filter(function (item) {
                   return item.id === records[x]._fields[y].identity.low + 10000
               })[0]
               // add other fields
               for (let z in records[x]._fields[y].properties) {
                   z_obj = records[x]._fields[y].properties[z];
                   switch (z) {          // handle dates & URLs
                       case 'id':
                           break;   // skip id field as already displayed
                       case 'type':
                           break;   // skip id field as already displayed
                       case 'label':
                           break;   // skip id field as already displayed
                       case 'date':
                           current_edge[z] = z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
                           break;
                       default:
                           current_edge[z] = JSON.stringify(z_obj).slice(1, -1);
                   }
               }
              if (current_edge.type === 'REALIZATION' || current_edge.type === 'PERFORMED_IN' ||
               current_edge.type === 'ARRANGEMENT' ) {
                        current_edge.color = {
                            color: 'hsl(0, 100%, 90%)',
                            opacity: 1.0
                        };
                        current_edge.original_color = {
                            color: 'hsl(0, 100%, 90%)',
                            opacity: 1.0
                        };
              }
              else if (current_edge.type === 'ITEM') {
                  current_edge.color = {
                      color: 'hsl(0, 80%, 50%)',
                      opacity:1.0
                  };
                  current_edge.original_color = {
                      color: 'hsl(0, 80%, 50%)',
                      opacity:1.0
                  };
              }
           }
        }
      }
    }
      data = {
          nodes: nodes,
          edges: edges
      }
      return data;
   }

  let addnode = (former, records) => {
      let nodes = former.nodes;
      let edges = former.edges;
      let returned_data = handle_data(nodes,edges,records);
      let current_data = {
         nodes: returned_data.nodes,
         edges: returned_data.edges
     }
    network.setData(current_data);
    return current_data;
  }

  /** Add Neo4j result records to Vis graph */
  let json2graph = (records) => {
     let nodes = [];
     let edges = [];
     let retured_data = handle_data(nodes,edges,records);
     let current_data = {
         nodes: retured_data.nodes,
         edges: retured_data.edges
     }
    options.layout = {
      randomSeed: undefined,
      improvedLayout:true,
      clusterThreshold: 150,
      hierarchical: {
      enabled:false,
      levelSeparation: 150,
      nodeSpacing: 100,
      treeSpacing: 200,
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
      direction: 'UD',        // UD, DU, LR, RL
      sortMethod: 'hubsize',  // hubsize, directed
      shakeTowards: 'leaves'  // roots, leaves
    }
  }
    network.setOptions(options);
    network.setData(current_data);
    return current_data;
  }

  /** Listeners & Actions attached to Cytoscape display & elements **/

  /* Change graph layout */
  $('#layout-breadthfirst').addEventListener('click', function(){
      options.layout =  {
          improvedLayout: true,
          hierarchical: {
				enabled: true,
				levelSeparation: 250,
				nodeSpacing: 110,
				treeSpacing: 200,
				blockShifting: false,
				edgeMinimization: true,
				parentCentralization: true,
				direction: "LR",
				sortMethod: "directed",
				shakeTowards: "roots"
			}
		}
	  network.setOptions(options);
      network.setData(newdata);
    }
  );
  $('#layout-fcose').addEventListener('click', function(){
        options.layout =  {
          improvedLayout: true,
          hierarchical: {
				enabled: true,
				levelSeparation: 250,
				nodeSpacing: 110,
				treeSpacing: 200,
				blockShifting: false,
				edgeMinimization: true,
				parentCentralization: true,
				direction: "RL",
				sortMethod: "directed",
				shakeTowards: "roots"
			}
		}
		network.setOptions(options);
        network.setData(newdata);
  });
  $('#layout-concentric').addEventListener('click', function(){
      options.layout =  {
          improvedLayout: true,
          hierarchical: {
				enabled: true,
				levelSeparation: 250,
				nodeSpacing: 110,
				treeSpacing: 200,
				blockShifting: false,
				edgeMinimization: true,
				parentCentralization: true,
				direction: "UD",
				sortMethod: "directed",
				shakeTowards: "roots"
			}
		}
		network.setOptions(options);
        network.setData(newdata);

  });
  $('#layout-cola').addEventListener('click', function(){
         options.layout =  {
          improvedLayout: true,
          hierarchical: {
				enabled: true,
				levelSeparation: 200,
				nodeSpacing: 110,
				treeSpacing: 100,
				blockShifting: false,
				edgeMinimization: true,
				parentCentralization: true,
				direction: "DU",
				sortMethod: "directed",
				shakeTowards: "roots"
			}
		}
		network.setOptions(options);
        network.setData(newdata);

  });


  $('#clear_canvas').addEventListener('click', function(){
       network.destroy();
  });

    $('#cluster').addEventListener('click', function(){
      var options = {
          joinCondition:function(nodeOptions) {
       return nodeOptions.group === newdata.nodes[0].group;
       }
       }
        network.clustering.cluster(options);
  });


  $('#reset_zoom').addEventListener('click', function(){
        network.fit();

  });
  // $('#layout-spread').addEventListener('click', function(){ cy.layout( layouts['spread'] ).run() });
  // $('#resizeCanvas').addEventListener('click', function(){ resizeCanvas(); cy.reset();  });
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

  network.on('deselectNode',function (e) {
        newdata.edges.forEach((item)=>{
              item.color = item.original_color;
        });
        newdata.nodes.forEach((item)=>{
              item.group = item.originalGroup;
        });
        network.setData(newdata);
  })

  network.on('selectNode',function (object) {
      var node_id = object.nodes[0];
      var select_node = newdata.nodes.filter(function (item) {
               return item.id === node_id
        })
      console.log(select_node[0]);
      let txt = '<p><b>ID: ' + select_node[0]['id2'] + '</b></p>';
      txt = txt.replace(/_/g, ' ')   // replace _ with space
        // temporary storage
      let comment_text;
      let link_text;
      let date_text;
      for (let x in select_node[0]) {
        switch (x) {          // handle dates & URLs
        case 'id': break;   // skip id field as it is just a node no. We'll display id2
        case 'id2': break;  // already displayed
		case 'group': break;  // skip this field
        case 'comment':
		  if ( select_node[0][x] !== '' ) {
            comment_text = select_node[0][x]
            comment_text = comment_text.replace(/\\n/g, '<br/>')  // replace \\n in the text with <br>
		    comment_text = comment_text.replace(/\\/g, '')
			comment_text = comment_text.replace(/[‘’“”]/g, '\'')  // replace pretty quotation marks with plain quote
            txt += '<p><em>comment</em>: ' + comment_text + '</p>'
		  }
          break;
        case 'birthDate':
        case 'deathDate':
        case 'date':
          date_text = select_node[0][x]
          date_text = date_text.replace('-1-1', '')  // remove Jan 1st, and retain just the year.
		  date_text = date_text.replace('-01-01', '')
          txt += '<p><em>' + x + '</em>: ' + date_text + '</p>'
		  break;
        case 'thumbnailURL':  // display thumbnail image
          txt += '<p><a target="_blank" href="' + select_node[0].accessURL[0]  + '">'
          txt += '<img alt="Photograph" width="200" src="' + select_node[0].thumbnailURL[0] +'"/></a></p>'
          break;
        case 'accessURL':
          for (link in select_node[0][x]) {
              link_URL = select_node[0].accessURL[link]

                if (link_URL.search("pdf")>=0) { link_text = 'PDF'   // PDF file
                } else if (link_URL.search("jpg")>=0) { link_text = 'JPG'
                } else if (link_URL.search("youtube")>=0) { link_text = 'YouTube'
                } else { link_text = 'Webpage' }

                txt += '<p><a href="' + link_URL +'" target="_blank"><b>' + link_text + '</b></a></p>'
          }
          break;
        default: txt += '<p><em>' + x + '</em>: ' + select_node[0][x] + '</p>'
      }
    }
	$('#node-expand').value = select_node[0]['id2'];  // Add neo4j node ID2 to button value - to pass to listener when clicked
	$('#node-remove').value = select_node[0]['id'];   // Add cytoscape node ID to button value
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block';
	$('#graph-popup1-menu').style.display = 'block';
	// Create an event for Google Tag Manager trigger
    dataLayer.push({'event': 'graph-node-click'});


     let connected_nodes = network.getConnectedNodes(select_node[0].id);
     let connected_edges = network.getConnectedEdges(select_node[0].id);
     console.log(connected_edges);
     console.log(connected_nodes)
     newdata.nodes.forEach((i)=>{
         i.group = 'Unselected'
     })
     newdata.edges.forEach((i)=>{
         i.color = {
              color: '#eee',
              opacity: 1.0
          };
     })
     select_node[0].group = select_node[0].originalGroup;
     connected_nodes.forEach((i)=>{
          let target = newdata.nodes.find((item)=>{
                     return item.id === i;
          })
           target.group = target.originalGroup;
     })
     connected_edges.forEach((i)=>{
         let target = newdata.edges.find((item)=>{
                     return item.id === i;
          })
          target.color= target.original_color;
     })
     network.setData(newdata);
    })

   network.on('selectEdge',function (object) {
       var edge_id = object.edges[0];
       var select_edge = newdata.edges.filter(function (item) {
               return item.id === edge_id
        })[0];
       console.log(select_edge)
       let txt = '<p><b>Relation: ' + select_edge.type + '</b></p>';  // html text to display in panel
       for (let x in select_edge) {
          switch (x) {
         case 'id': break;       // skip
		 case 'from': break;   // skip
		 case 'to': break;   // skip
         case 'type':  break;
         case 'color': break;
         case 'comment':
          comment_text = select_edge[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')
		  comment_text = comment_text.replace(/\\/g, '')
		  comment_text = comment_text.replace(/[‘’“”]/g, '\'')
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        default: txt += '<p><em>' + x + '</em>: ' + select_edge[x] + '</p>'
      }
    }
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block';
	$('#graph-popup1-menu').style.display = 'none';
   })

   network.on('hoverNode',function (obj) {
          console.log('111')
   })



  /* Add listeners for expanding and removing existing Cytoscape nodes */
  // expand node id stored in button value
  $('#node-expand').addEventListener('click', function() {
    expand_node( $('#node-expand').value, '0', 'query') // $('#node-expand').value contains the node ID used in neo4j database
  });
  // remove node stored in button value
  $('#node-remove').addEventListener('click', function() {
      var node_id = $('#node-remove').value;
      let connected_edges = network.getConnectedEdges(node_id);
      let newnodes = newdata.nodes.filter(function (item) {
          return item.id !== Number(node_id)
      })
      let newedges = []
      for (var i=0; i<=newdata.edges.length-1; i++) {
          var pushed = true;
          for (var k=0; k<=connected_edges.length-1; k++) {
                if (connected_edges[k] === newdata.edges[i].id) {
                      pushed = false;
                }
          }
          if (pushed) {
              newedges.push(newdata.edges[i])
          }
      }
      newdata = {
          nodes : newnodes,
          edges : newedges
      }
      network.setData(newdata)
  });
  });
})();

