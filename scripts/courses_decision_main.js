var tree = function(){
    var tree = courses_tree;
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
                courses.push(course_data[i]);
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
