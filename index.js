'use strict';

function updateCheckboxes(id){
    let checkedBoxes = 0;

    for(let i = 0; i < rowCount; i++){
        if(document.getElementById('checkbox-' + i).checked){
            checkedBoxes += 1;
        }
    }

    if(checkedBoxes > checkboxLimit){
        document.getElementById(id).checked = false;
        window.alert('A faculty member may be granted no more than two (2) years of extension during the probationary period.');

    }else{
        updateTable();
    }
}

function updateTable(){
    const dayValue = Number(document.getElementById('day').value);
    let reviewCount = 0;
    const reviews = [
      'Merit',
      'Mid-career',
      'Final appraisal',
    ];
    const semesters = [
      'Spring',
      'Fall',
    ];
    let semesterYear = year;
    let semesterCount = 0;

    for(let i = 0; i < rowCount; i++){
        const semester = dayValue === 1
          ? 1 - i % 2
          : i % 2;

        if(i > 0 && semester === 0){
            semesterYear += 1;
        }

        if(!document.getElementById('checkbox-' + i).checked){
            semesterCount += 1;
        }

        document.getElementById('semesterCount-' + i).textContent = semesterCount;
        document.getElementById('semester-' + i).textContent = semesters[semester] + ' ' + semesterYear;

        if(reviewSemesters.includes(i)){
            const semsterDue = i === 3 || dayValue === 1
              ? semesters[1]
              : semesters[0];

            document.getElementById('review-' + i).innerHTML = reviews[reviewCount]
              + ' effective 7/1/' + semesterYear + ' due ' + semsterDue + ' ' + (semesterYear - 1)
              + '<br>review period from 7/1/' + year + ' through 6/30/' + (semesterYear - 1);

            reviewCount += 1;
        }
    }
}

const checkboxLimit = 4;
const reviewSemesters = [
  3, 7, 11,
];
const rowCount = 16;
let year = 0;

window.onload = function(){
    year = new Date().getFullYear();

    document.getElementById('day').onchange = updateTable;

    const yearElement = document.getElementById('year');
    yearElement.value = year;
    yearElement.oninput = function(){
        year = Number(this.value);
        updateTable();
    };
    yearElement.onwheel = function(event){
        event.preventDefault();

        year += event.deltaY > 0
          ? -1
          : 1;
        this.value = year;

        updateTable();
    };

    let tableRows = '';
    for(let i = 0; i < rowCount; i++){
        tableRows += '<tr><td><input id=checkbox-' + i + ' type=checkbox>';
        tableRows += '<td id=semesterCount-' + i + '>';
        tableRows += '<td id=semester-' + i + '>';
        tableRows += '<td id=review-' + i + '>';
    }
    document.getElementById('tableBody').innerHTML = tableRows;

    for(let i = 0; i < rowCount; i++){
        document.getElementById('checkbox-' + i).onchange = function(){
            updateCheckboxes(this.id);
        };
    }

    updateTable();
};
