var tree = function(){
    var tree = courses_tree,
        that = this;
    var course_data = []
    $.getJSON("courses.json", function(data){
        course_data = data;
        for(var i = 0; i < data.length; i++){
            tree.add_course(data[i]);
        }
    });

    // what's the worst complexity possible?
    // That's right. THIS !!
    var calculate_possible_courses = function(){
        var courses = [];
        for(var i = 0; i < course_data.length; i++){
            if (tree.is_course_possible(course_data[i].code)){
                courses.push(course_data[i].code);
            }
        }
        return courses;
    };

    // return all hooks
    return {
        toggle_course_done: function(course_code, success, fail){
            if (!tree.get_course(course_code)){
                if (typeof fail === 'function') fail();
            } else {
                if (tree.is_course_done(course_code)){
                    tree.mark_course_not_done(course_code);
                    if (typeof success === 'function') success({done: false});
                } else {
                    tree.mark_course_done(course_code);
                    if (typeof success === 'function') success({done: true});
                }
            }
        },

        get_possible_courses: function(){
            return calculate_possible_courses();
        },

        get_course_list: function(){
            return tree.get_course_list();
        },
    }
}();
// on dom ready, draw the digraph
$(function(){
    var courses = tree.get_course_list();
    var possible_courses = tree.get_possible_courses();
    var that = this;

    var svg = d3.select("svg"),
        inner = svg.select("g"),
        zoom  = d3.behavior.zoom().
                on("zoom", function() {
            inner.attr("transform", "translate(" + d3.event.translate + ")" +
                "scale(" + d3.event.scale + ")");
        }).scaleExtent([0, 2]);
    svg.call(zoom);
    var render = new dagreD3.render();
    var g = new dagreD3.graphlib.Graph();
    g.setGraph({
        nodesep:75,
        ranksep: 50,
        rankdir: "LR",
        marginx: 20,
        marginy: 20
    });

    var update_tree_info = function(){
        var _ = g.nodes()
        var results = window.search_results || [];
        for(var i = 0; i < _.length; i++){
            g.removeNode(_[i]);
        }
        var _ = g.edges()
        for(var i = 0; i < _.length; i++){
            g.removeEdge(_[i]);
        }
        possible_courses = tree.get_possible_courses();
        for (var code in courses){
            var course = courses[code];
            var className = "course";
            // yes, n**2
            var possible = ($.inArray(code, possible_courses) !== -1)
            className += ((possible === true) ? " sambhav": " asambhav");
            if (courses_tree.is_course_done(code)){
                className += " complete";
            }
            if ($.inArray(code, results) !== -1){
                className += " searchresult";
            }
            var html = "<div>";
            html += "<span class=coursecode>" + code + "</span>";
            html += "-<span class=coursetitle>" + course.title + "</span>";
            html += "</div>";
            g.setNode(code,{
                labelType: "html",
                label: html,
                rx: 5,
                ry: 5,
                padding: 0,
                class: className
            });

            if (course.prereqs !== undefined){
                for(var i in course.prereqs){
                    prereq = course.prereqs[i];

                    if ($.inArray(prereq, g.nodes()) === -1) continue;
                    // I HATE HATE the courses repository.
                    // why couldn't you keep the repo updated.
                    // This bug occurs when a course has a prerequisite
                    // but the repo doesn't have the information of that
                    // prerequisite course. So, it tries to add an edge
                    // to a non existent node.
                    // Took me an hour -_-

                    var style = {
                        width: 40,
                        lineInterpolate: 'basis',
                        // style: "stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;"
                    };
                    // if (possible === true){
                    //     style.style = "fill: #f66;"
                    // }
                    g.setEdge(prereq, code, style);
                }
            }
        }
        console.log("Updated tree");
    }

    update_tree_info();


    function draw(isUpdate){
        inner.call(render, g);
        if (isUpdate){
            var zoomScale = zoom.scale();
            var graphWidth = g.graph().width + 80;
            var graphHeight = g.graph().height + 40;
            var width = parseInt(svg.style("width").replace(/px/, ""));
            var height = parseInt(svg.style("height").replace(/px/, ""));
            zoomScale = Math.min(width / graphWidth, height / graphHeight);
            var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];
            zoom.translate(translate);
            zoom.scale(zoomScale);
            zoom.event(isUpdate ? svg.transition().duration(500) : d3.select("svg"));
        }
    }

    draw(true);

    var selections = inner.selectAll("g.node");
    selections.on('click', function (d) {
        tree.toggle_course_done(d, function(result){
            // if (result.done === true) console.log("You've marked completed -> " + d);
            // else console.log("You've marked incomplete -> " + d);
        }, function(){
            throw {
                name: "RunTimeError",
                message: "Could not get course with code: " + d
            }
        })
        update_tree_info();
        draw(false)
    });

    window.course_search_query = "";
    window.search_results = []
    $(document).keypress(function(e){
        e = e || window.event;
        if (e.keyCode == 27){
            window.course_search_query = "";
            window.search_results = []
        } else{
            if (e.keyCode == 8){
                _ = window.course_search_query;
                window.course_search_query = _.slice(0, -1);
            } else {
                ch = String.fromCharCode(e.which).toUpperCase();
                window.course_search_query = window.course_search_query + ch;
            }
            var results = [];
            if (window.course_search_query !== "") {
                var query = window.course_search_query;
                for(var code in courses){
                    if (code.indexOf(query) !== -1 ||
                        courses_tree.get_course(code).title.
                        toUpperCase().indexOf(query) !== -1){
                        results.push(code);
                    }
                }
            }
            window.search_results = results;
        }
        update_tree_info();
        draw();
    })

    // setInterval(function(){
    //     draw(true);
    // }, 10000)

}); // on dom ready
