var tree = function(){
    var tree = courses_tree;
    var course_data = ""
    $.getJSON("courses.json", function(data){
        course_data = data;
        for(var i = 0; i < data.length; i++){
            tree.add_course(data[i]);
        }
    });
    return tree;
}();
