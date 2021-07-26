'use strict';

function resetAll(){
    year = new Date().getFullYear();

    document.getElementById('day').value = 1;
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
    const tableContents = {};
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

    // Semester and review calculation loop.
    for(let i = 0; i < rowCount; i++){
        const semester = dayValue === 1
          ? 1 - i % 2
          : i % 2;

        meritCount += 1;
        let needsReview = false;
        let reviewType = '';
        let reviewYearFrom = year;
        let semesterCountDisplay = '';
        let yearEffective = 0;

        if(i > 0 && semester === 0){
            semesterYear += 1;
        }

        const semesterDisplay = semesters[semester] + ' ' + semesterYear;

        if(!document.getElementById('checkbox-' + i).checked){
            semesterCount += 1;
            semesterCountDisplay = semesterCount;

            if(reviewSemesters.includes(semesterCount)
              || (reviewCount < 3 && meritCount === 4 && !reviewSemesters.includes(semesterCount + 1))){
                needsReview = true;
                reviewType = reviews[reviewCount];

                if(reviewSemesters.includes(semesterCount)){
                    reviewCount += 1;

                }else if(reviewCount < 3 && meritCount === 4 && !reviewSemesters.includes(semesterCount + 1)){
                    meritAdditional += 1;
                    reviewType = reviews[0];
                    reviewYearFrom += 1;
                }

                yearEffective = semesterYear + meritAdditional;
                if(semesterCount === i + 1 && (semesterCount === reviewSemesters[0] || dayValue === 1)){
                    yearEffective += 1;
                }

                meritCount = 0;
            }
        }

        tableContents[i] = {
          'needsReview': needsReview,
          'reviewType': reviewType,
          'reviewYearFrom': reviewYearFrom,
          'semester': semester,
          'semesterCountDisplay': semesterCountDisplay,
          'semesterDisplay': semesterDisplay,
          'semesterYear': semesterYear,
          'yearEffective': yearEffective,
        };
    }

    // Review string creation and row render loop.
    for(const i in tableContents){
        let reviewString = '';
        const row = tableContents[i];

        if(row['needsReview']){
            reviewString = row['reviewType'] + ' effective 7/1/' + row['yearEffective']
              + ', due ' + row['semesterDisplay'];

            let reviewDue = '6/30/' + row['semesterYear'];
            if(row['semester'] === 0){
                reviewString += ' (Spring case)';
                reviewDue = '12/31/' + (row['semesterYear'] - 1);
            }
            reviewString += ', review period from ' + (dayValue * 6 + 1) + '/1/' + row['reviewYearFrom']
              + ' through ' + reviewDue;
        }

        document.getElementById('review-' + i).innerHTML = reviewString;
        document.getElementById('semesterCount-' + i).textContent = tableContents[i]['semesterCountDisplay'];
        document.getElementById('semester-' + i).textContent = tableContents[i]['semesterDisplay'];
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
