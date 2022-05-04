import story_arr from "./data.js";

document.addEventListener('DOMContentLoaded',function () {
    let $ = selector => document.querySelector( selector );
    let ul = document.querySelector('ul');
   let right_div = document.querySelector('.right');
   let arr = story_arr;
   let html = '';
   let current_li_index=0;
   let current_div_index=0;
   arr.forEach((obj,index) =>{
      // create li(left) and div (right)
         if (index === 0) {
              html = html + `<li class="active"`+` data-index=${index+1}><p class="header">
                 ${obj.header}</p>
                 <p class="text">`+createText(obj.text)+`</p>
                 <div class="footer">
                 <button class="previous" disabled>Previous</button>
                 <select class="story_selection" name="story_id">`+ createOptions(index)+ `                   
                 </select>
                 <button class="next">Next</button>
                 </li></div> `;
              let div = document.createElement('div');
              let div_html = `<div class="info_box">`+createImgs(index)+`</div><div class="graph_area">
 <div `+`class= cy${index}`+` style='height:100%; width:100%; display:block; border-style:solid; border-width:1px; border-color:hsl(280,53%,60%); background-color:hsl(280,53%,98%); box-shadow: rgb(222,160,248) 0 0 1px 1px;);'></div>
</div>`
              div.className='story active';
              div.innerHTML=div_html;
              div.setAttribute('data-index',(index+1).toString());
              right_div.appendChild(div);
         } else {
             if (index === arr.length-1){
                 html += `<li`+` data-index="${index+1}"><p class="header">
                 ${obj.header}</p>
                   <p class="text">`+createText(obj.text)+`</p>
                   <div class="footer">
                   <button class="previous">Previous</button>
                   <select class="story_selection" name="story_id">`+createOptions(index)+`                   
                   </select>
                   <button class="next" disabled>Next</button>
                   </li></div> `;
             } else {
                   html += `<li`+` data-index="${index+1}"><p class="header">
                 ${obj.header}</p>
                 <p class="text">`+createText(obj.text)+`</p>
                 <div class="footer">
                 <button class="previous">Previous</button>
                 <select class="story_selection" name="story_id">`+ createOptions(index)+
                       `</select>
                 <button class="next">Next</button>
                 </li></div> `;
             }
             let div = document.createElement('div');
             let div_html = `<div class="info_box">`+createImgs(index)+`</div><div class="graph_area">
   <div `+ `class= cy${index}`+` style='height:100%; width:100%; display:block; border-style:solid; border-width:1px; border-color:hsl(280,53%,60%); background-color:hsl(280,53%,98%); box-shadow: rgb(222,160,248) 0 0 1px 1px;);'></div>
   </div>`
             div.className='story'
             div.innerHTML=div_html;
             div.setAttribute('data-index',(index+1).toString());
             right_div.appendChild(div);
         }

   })
   ul.innerHTML = html;
   let next_buttons = document.querySelectorAll('.next');
   let previous_buttons = document.querySelectorAll('.previous');
   let selections = document.querySelectorAll('.story_selection');
   let li_list = document.querySelectorAll('li');
   let div_list = document.querySelectorAll('.right .story');
   next_buttons.forEach((item,index) => {
          item.addEventListener('click', (e) =>{
                     li_list[index].className ='';
                     li_list[index+1].className='active';
                     div_list[index].className='story';
                     console.log(div_list[index+1])
                     div_list[index+1].className='story active';
                     current_li_index = index+1;
                     renderGraph(index+1);

          })
   })

   previous_buttons.forEach((item,index)=>{
            item.addEventListener('click', (e) =>{
                     li_list[index].className ='';
                     li_list[index-1].className='active';
                     div_list[index].className='story';
                     div_list[index-1].className='story active';
                     current_li_index = index-1;
                     renderGraph(index-1);
          })
   })

   selections.forEach((item,index)=>{
           item.addEventListener('change',()=>{
                 let index = item.selectedIndex;
                 let value = item.options[index].value;
                 let target_selec_obj = selections[value];
                 target_selec_obj.options[value].selected =true;
                 li_list[current_li_index].className = '';
                 div_list[current_li_index].className='story';
                 selections[current_li_index].options[current_li_index].selected=true;
                 li_list[value].className='active';
                 div_list[value].className='story active';
                 current_li_index = value;
                 renderGraph(value);
           })
   })

    function createImgs(index) {
          return arr[index].infoBox.reduce((pre,current)=>{
                   if(current.image_URL!=='') {
                        return pre+`<img class="image" alt="Images" `+`src=${current.image_URL} />`
                   } else {
                       return ''
                   }
          },'')
    }

   function createText(text) {
         return text.reduce((pre,current)=>{
                 if(pre==='') {
                      return pre+`${current}`
                 } else {
                    return pre+ `\n\n${current}`
                 }
         },'')
   }


   function createOptions(index) {
        let len = arr.length;
        let optionStr = '';
        for(let i=0; i<=len-1;i++) {
              if(i===index) {
                optionStr += `<option `+`value=${i} selected>${i+1}:${story_arr[i].header}</option>`
              } else {
                optionStr += `<option `+`value=${i}>${i+1}:${story_arr[i].header}</option>`
              }
        }
        return optionStr
   }
     $("#graph-popup1-close").addEventListener('click', function() { $("#graph-popup1").style.display = "none" });
    $("#graph-popup1").addEventListener('dblclick', function() { $("#graph-popup1").style.display = "none" });

   function renderGraph(index) {
       let container = document.querySelector('.cy'+index);
       console.log('.cy'+index)
   	   let data = {
	    nodes:[],
        edges:[]
      }

       let newdata;

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

       function Title(text) {
         const container = document.createElement('div');
         container.innerText = text;
         return container;
         }

       async function retrieve(parameter, queryID, elementID_query) {

        // Display TOPIC (query keyword) as page header
  //      document.getElementById(elementID_query).innerHTML = parameter.toUpperCase().replace(/_/g, ' ')

        // fetch template
        // fetch(url, options).then(response => response.json()).then(result => /* process result */)

        let API_domain = 'https://chriskhoo.net'
        let API_router = 'ZS'
        let API_queryID = queryID
        let API_param = parameter
        let API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param}`

        fetch(API_string)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server API didn't respond")
                }
                return response.json()
            })
            .then(json_value => {
                console.log(json_value)
                if (json_value.length > 0) {
                    newdata = json2graph(json_value)             // add search results to graph
                }
            })
            .catch(error => {
                console.error('Problem with the fetch operation from server API', error)
            })
    }

       function handle_data(nodes,edges,records) {
      let z_obj;
      for (let x in records) {  // Process each record

	  /* Process all the node fields first */
       for (let y in records[x]._fields) {  // Process each field in record

        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null)

	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // the field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // skip for now

        } else {    // field is a NODE, not relation
          let has_node = nodes.filter(function (item) {
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
           let  has_edge = edges.filter(function (item) {
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
          for (let link in select_node[0][x]) {
            let   link_URL = select_node[0].accessURL[link]

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
         let comment_text = select_edge[x]
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

       if(index>=0&&index<3) {
            retrieve('_','2d','query').then(e=> console.log('ok'));
       } else if(index<5) {
            retrieve('Photograph','2b','query').then(e=> console.log('ok'))
       } else if(index<7) {
           retrieve('Speech','2b','query').then(e=> console.log('ok'))
       } else {
           retrieve('Documentary','2b2','query').then(e=> console.log('ok'))
       }

   }
   renderGraph(0);


})

