var courses_tree = function(){
    var courses = {};
    var done_courses = {};
    var check_course_code = function(course){
        if (!course || typeof course.code !== 'string'){
            throw {
                name: "TypeError",
                message: "Course object should have a `code` string attribute"
            }
        }
    };

    var pythonic_all = function(arr, check_function){
        for(var i = 0; i < arr.length; i++){
            if (!check_function(arr[i])) return false;
        }
        return true;
    }

    return {
        add_course: function(course){
            check_course_code(course);
            courses[course.code] = course;
            return course;
        },

        get_course: function(code){
            return courses[code]; // allow undefined to be sent up
        },

        get_course_list: function(){
            return courses;
        },

        mark_course_done: function(code){
            var course = this.get_course(code);
            if (course !== undefined){
                if (!(done_courses[course] && done_courses[course] === true)){
                    done_courses[code] = true;
                    if(course.prereqs && course.prereqs.constructor === Array){
                        for(var i = 0; i < course.prereqs.length; i++){
                            this.mark_course_done(course.prereqs[i]);
                        }
                        return true;
                    }
                }
            }
            return false;
        },

        mark_course_not_done: function(code){
            var course = this.get_course(code);
            if (course !== undefined){
                done_courses[code] = false;
                return true;
            }
            return false;
        },

        is_course_done: function(code){
            var course = this.get_course(code);
            if (course){
                if (done_courses[code]){  // also skips undefined to false
                    return true;
                }
            }
            return false;
        },

        is_course_possible: function(code){
            var course = this.get_course(code),
                prereqs = (course && course.prereqs) || [],
                that = this;
            if (course === undefined){
                throw {
                    name: "NotFoundError",
                    message: "Could not find course code " + code
                };
            }
            return pythonic_all(prereqs, function(code){
                var course = that.get_course(code);
                return course && course.code && done_courses[course.code] // prevent TypeError to be thrown up
            });
        }
    };
}();
