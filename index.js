'use strict';

function resetAll(){
    year = new Date().getFullYear();

    document.getElementById('day').value = 0;
    document.getElementById('year').value = year;

    for(let i = 0; i < rowCount; i++){
        document.getElementById('checkbox-' + i).checked = false;
    }

    updateTable();
}

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
    const reviews = [
      'Merit',
      'Mid-career',
      'Final appraisal',
    ];
    const reviewSemesters = [
      2 + dayValue,
      7,
      11,
    ];
    const semesters = [
      'Spring',
      'Fall',
    ];

    let meritAdditional = 0;
    let meritCount = 0;
    let reviewCount = 0;
    let semesterYear = year;
    let semesterCount = 0;

    for(let i = 0; i < rowCount; i++){
        const semester = dayValue === 1
          ? 1 - i % 2
          : i % 2;

        meritCount += 1;
        let reviewDisplay = '';
        let semesterCountDisplay = '';

        if(i > 0 && semester === 0){
            semesterYear += 1;
        }

        const semesterDisplay = semesters[semester] + ' ' + semesterYear;

        if(!document.getElementById('checkbox-' + i).checked){
            semesterCount += 1;
            semesterCountDisplay = semesterCount;

            if(reviewSemesters.includes(semesterCount)
              || (reviewCount < 3 && meritCount === 4 && !reviewSemesters.includes(semesterCount + 1))){
                let reviewType = reviews[reviewCount];
                let reviewYearFrom = year;

                if(reviewSemesters.includes(semesterCount)){
                    reviewCount += 1;

                }else if(reviewCount < 3 && meritCount === 4 && !reviewSemesters.includes(semesterCount + 1)){
                    meritAdditional += 1;
                    reviewType = reviews[0];
                    reviewYearFrom += 1;
                }

                let yearEffective = semesterYear + meritAdditional;
                if(semesterCount === i + 1 && (semesterCount === reviewSemesters[0] || dayValue === 1)){
                    yearEffective += 1;
                }

                reviewDisplay = reviewType + ' effective 7/1/' + yearEffective
                  + ', due ' + semesterDisplay;

                let reviewDue = '6/30/' + semesterYear;
                if(semester === 0){
                    reviewDisplay += ' (Spring case)';
                    reviewDue = '12/31/' + (semesterYear - 1);
                }
                reviewDisplay += ', review period from ' + (dayValue * 6 + 1) + '/1/' + reviewYearFrom
                  + ' through ' + reviewDue;

                meritCount = 0;
            }
        }

        document.getElementById('review-' + i).innerHTML = reviewDisplay;
        document.getElementById('semesterCount-' + i).textContent = semesterCountDisplay;
        document.getElementById('semester-' + i).textContent = semesterDisplay;
    }
}

let checkboxLimit = 4;
let rowCount = 16;
let year = 0;

window.onload = function(){
    document.getElementById('day').onchange = updateTable;
    document.getElementById('resetAll').onclick = resetAll;

    const yearElement = document.getElementById('year');
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
        tableRows += '<td class=center id=semesterCount-' + i + '>';
        tableRows += '<td id=semester-' + i + '>';
        tableRows += '<td id=review-' + i + '>';
    }
    document.getElementById('tableBody').innerHTML = tableRows;

    for(let i = 0; i < rowCount; i++){
        document.getElementById('checkbox-' + i).onchange = function(){
            updateCheckboxes(this.id);
        };
    }

    resetAll();
};
