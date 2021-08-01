'use strict';

function resetAll(){
    month = 7;
    year = new Date().getFullYear();

    document.getElementById('month').value = month;
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
    const reviews = [
      'Merit',
      'Mid-career',
      'Final appraisal',
    ];
    const reviewSemesters = [
      2,
      7,
      11,
    ];
    reviewSemesters[0] += month === 7
      ? 1
      : 0;
    const semesters = [
      'Spring',
      'Fall',
    ];

    let addMeritsToYear = true;
    let meritAdditional = 0;
    let meritCount = 0;
    let previousActiveSemester = 0;
    let reviewCount = 0;
    let semesterYear = year;
    let semesterCount = 0;

    // Semester and review calculation loop.
    for(let i = 0; i < rowCount; i++){
        tableContents[i] = {};

        const semester = month === 7
          ? 1 - i % 2
          : i % 2;

        meritCount += 1;
        let needsReview = false;
        let reviewType = '';
        let reviewYearFrom = year;
        let semesterCountDisplay = '';

        if(i > 0 && semester === 0){
            semesterYear += 1;
        }
        let yearEffective = semesterYear;

        const semesterDisplay = semesters[semester] + ' ' + semesterYear;

        if(!document.getElementById('checkbox-' + i).checked){
            previousActiveSemester = semesterCount;
            semesterCount += 1;
            semesterCountDisplay = semesterCount;

            if(reviewCount === 0 && meritCount > 4){
                tableContents[previousActiveSemester]['needsReview'] = true;
                tableContents[previousActiveSemester]['reviewType'] = reviews[0];
                tableContents[previousActiveSemester]['yearEffective'] += 1;
                meritAdditional += 1;
                addMeritsToYear = false;

                for(var row = 0; row <= i - previousActiveSemester; row++){
                    tableContents[previousActiveSemester + row]['meritCount'] = row;
                    meritCount = row;
                }
            }

            const isMeritAdditional = reviewCount < 3 && meritCount === 4 && !reviewSemesters.includes(semesterCount + 1);
            const isReviewSemester =
              (meritAdditional === 0 && semesterCount === reviewSemesters[0])
              || (reviewCount > 0 && reviewSemesters.includes(semesterCount));

            if(isReviewSemester || isMeritAdditional){
                needsReview = true;
                reviewType = reviews[reviewCount];

                if(isReviewSemester){
                    reviewCount += 1;

                }else if(isMeritAdditional){
                    meritAdditional += 1;
                    reviewType = reviews[0];
                    reviewYearFrom += 1;
                    if(i > 3){
                        reviewCount += 1;
                    }
                    if(!addMeritsToYear){
                        yearEffective += 1;
                    }
                }

                if(semesterCount === i + 1 && (semesterCount === reviewSemesters[0] || month === 7)){
                    yearEffective += 1;
                }

                meritCount = 0;
            }
        }

        if(addMeritsToYear){
            yearEffective += meritAdditional;
        }

        tableContents[i] = {
          'meritCount': meritCount,
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
            reviewString += ', review period from ' + month + '/1/' + row['reviewYearFrom']
              + ' through ' + reviewDue;
        }

        document.getElementById('review-' + i).innerHTML = reviewString;
        document.getElementById('semesterCount-' + i).textContent = tableContents[i]['semesterCountDisplay'];
        document.getElementById('semester-' + i).textContent = tableContents[i]['semesterDisplay'];
    }
}

let checkboxLimit = 4;
let month = 0;
let rowCount = 16;
let year = 0;

window.onload = function(){
    document.getElementById('month').onchange = updateTable;
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
        tableRows += '<tr><td><input id=checkbox-' + i + ' type=checkbox>'
         + '<td class=center id=semesterCount-' + i + '>'
         + '<td id=semester-' + i + '>'
         + '<td id=review-' + i + '>';
    }
    document.getElementById('tableBody').innerHTML = tableRows;

    for(let i = 0; i < rowCount; i++){
        document.getElementById('checkbox-' + i).onchange = function(){
            updateCheckboxes(this.id);
        };
    }

    resetAll();
};
