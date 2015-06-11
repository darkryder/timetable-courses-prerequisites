from bs4 import BeautifulSoup, element
import json
from string import strip
from urllib2 import urlopen

URL = "http://sites.iiitd.ac.in/courserepo/"
PREREQUISITE_MATCHER = "Pre-requisite: "


def check_tag(func):
    def inner(tag):
        if not isinstance(tag, element.Tag):
            raise TypeError("Tag element not passed.")
        return func(tag)
    return inner


@check_tag
def extract_code_and_credits(tag):
    check = tag.find_all('span', {'class': 'number'})
    if not check:
        return False
    line = str(check[0].text).strip().split()
    # first element would contain course code and last would be credits
    code = str(line[0])
    credits = int(line[-1][0])
    return (code, credits)


@check_tag
def extract_title(tag):
    check = tag.find_all('span', {'class': 'title'})
    if not check:
        return False
    return str(check[0].text.split(':')[-1].strip())


@check_tag
def extract_prerequisites(tag):
    # I know. You may kill me. But I can't find any other pattern.
    # And it works for this. So hurr!
    if PREREQUISITE_MATCHER in tag.text:
        return map(strip,
                   tag.text.strip().split(":")[-1].strip().split(','))


def main():
    courses = []
    soup = BeautifulSoup(urlopen(URL))
    elements_to_consider = soup.find_all('tr')
    for el in elements_to_consider:
        check = extract_code_and_credits(el)
        if check:
            # courses.append(CourseNode())
            courses.append({})
            current_course = courses[-1]
            current_course['code'] = check[0]
            current_course['credits'] = check[1]
            continue

        if len(courses) == 0:
            continue  # until the first node hasn't been added.
        current_course = courses[-1]

        check = extract_title(el)
        if check:
            current_course['title'] = check
            continue

        check = extract_prerequisites(el)
        if check:
            current_course['prereqs'] = check
            continue

    # printing data. Let file writing be handled by
    # shell by pipe to file if need be.
    print json.dumps(courses)

if __name__ == '__main__':
    main()
