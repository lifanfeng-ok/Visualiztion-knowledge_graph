const driver = neo4j.driver(
    'neo4j+s://fc5b611c.databases.neo4j.io',
    neo4j.auth.basic('anonymous', 'anonymous')
)
let graph = { nodes: [], edges: [] };
let types = { nodes: [], edges: [] };


let cs = { Cause: "#ff9999", Effect: "#A49393", Study: "#396EB0" };

const query = 'MATCH (n:Cause_Effect)-[R]->(Entity2) RETURN n,R,Entity2 LIMIT 50'


const query2 = `MATCH (Entity1 {type: $param})-[R]-(Entity2) RETURN Entity1, R, Entity2`

async function retrieve(parameter, queryText) {
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })
    try {
        const result = await session.readTransaction(tx =>
            tx.run(queryText, { param: parameter })
        )
        console.log(result.records);
        json2graph(result.records);
        // Load the graph in sigma
        s.graph.read(graph);
        // Ask sigma to draw it
        
        s.refresh();
        s.startForceAtlas2();
        console.log(graph);
        console.log(types);
        window.setTimeout(function () { s.killForceAtlas2(); }, 2000);
        var dragListener = sigma.plugins.dragNodes(s, s.renderers["main"]);

        s.bind('clickNode', function (e) {
            var neighbors = s.graph.neighborhood(e.data.node.id);
            console.log(neighbors.nodes[0].id);
            let nodeList = []
            neighbors.nodes.forEach(function (node) {
                nodeList.push(node.id)
            });
            console.log(nodeList);
            sigma.plugins.animate(
                s,
                {
                    size: "click_size"
                },
            );
            sigma.plugins.animate(
                s,
                {
                    size: "normal_size"
                },
                {
                    nodes: nodeList
                }
            );
            console.log(neighbors);
            console.log(e.data.node.comment);
            console.log(e.data.node.research_results);
            

            if (typeof e.data.node.research_results !== 'undefined') {
                console.log("research is not undefined!");
                document.getElementById('sidebar').innerHTML = e.data.node.research_results;
            } else {
                document.getElementById('sidebar').innerHTML = e.data.node.comment;
            }
            



        });
        s.bind('clickStage', function (e) {
            sigma.plugins.animate(
                s,
                {
                    size: "click_size"
                }
            );
        });



    } catch (error) {
        console.log(`unable to execute query. ${error}`)
    } finally {
        session.close()
    }

}

let json2graph = records => {
    for (x in records) {  // Process each record

        /* Process all the node fields first */
        for (y in records[x]._fields) {  // Process each field in record

            // check whether field represents a null (blank), a relation or a node
            if (records[x]._fields[y] === null) {   // field is blank (null) 

            } else if (typeof records[x]._fields[y].type !== 'undefined') {

                // the field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
                // skip for now

            } else if (!graph["nodes"].find(o => o.id === String(records[x]._fields[y].identity.low))) {    // field is a NODE, not relation
                var node = {
                    id: String(records[x]._fields[y].identity.low),
                    label: records[x]._fields[y].properties.label,
                    // note the ShapeLibrary.enumerate() returns the names of all
                    // supported renderers                    
                    x: Math.random(),
                    y: Math.random(),
                    size: 2,
                    normal_size: 2,
                    click_size: 0.5,
                    comment: records[x]._fields[y].properties.comment,
                    research_results: records[x]._fields[y].properties.research_results
                };
                if (records[x]._fields[y].properties.type in cs === true) {
                    node.type = "square",
                        node.color = cs[records[x]._fields[y].properties.type]
                };
                graph.nodes.push(node);
                types["nodes"].push({
                    "type": records[x]._fields[y].properties.type
                });

            }
            if (records[x]._fields[y] === null) {   // field is blank (null) 

            } else if (typeof records[x]._fields[y].type !== 'undefined' && !graph["edges"].find(o => o.id === String(records[x]._fields[y].identity.low))) {

                // field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
                // Add edge to graph
                graph["edges"].push({
                    id: String(records[x]._fields[y].identity.low),
                    source: String(records[x]._fields[y].start.low),
                    target: String(records[x]._fields[y].end.low),
                    type: "arrow",
                    size: 1
                });
                types["edges"].push({
                    "type": records[x]._fields[y].properties.type
                });

                //cy_ele = cy.$id(records[x]._fields[y].identity.low);  // retrieve newly created node to add more fields

                // add other fields

                // console.log(cy_ele.data());		  
            }
        }



    }
}



document.addEventListener('DOMContentLoaded', function(){
    s = new sigma({
        graph: graph,
        settings: {
            enableHovering: false
        },
        renderer: {
            id: 'main',
            type: 'canvas',
            container: 'sigma-container',
            freeStyle: true,
            settings: {
                batchEdgesDrawing: true,
            }
        }
    });
document.getElementById("Rapid_review").addEventListener('click', function () { retrieve('Rapid_review', query2) });

document.getElementById('Study').addEventListener('click', function () { retrieve('Study', query2) });

document.getElementById('Cause-Effect').addEventListener('click', function () { retrieve('Cause-Effect', query2) });

document.getElementById('clear_canvas').addEventListener('click', function(){ s.graph.clear() });
})




