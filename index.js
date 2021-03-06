'use strict';

function resetAll(){
    month = 7;
    year = new Date().getFullYear();

    document.getElementById('month').value = month;
    document.getElementById('year').value = year;

    for(let row = 0; row < rowCount; row++){
        document.getElementById('checkbox-' + row).checked = false;
    }

    updateTable();
}

function updateCheckboxes(id){
    let checkedBoxes = 0;

    for(let row = 0; row < rowCount; row++){
        if(document.getElementById('checkbox-' + row).checked){
            checkedBoxes += 1;
        }
    }

    if(checkedBoxes > checkboxLimit){
        document.getElementById(id).checked = false;
        window.alert('A faculty member may be granted no more than two (2) years of extension during the probationary period.');

    }else{
        checkedBox = checkedBoxes;
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
    let midRow = 0;
    let midYear = false;
    let previousActiveSemester = 0;
    let reviewCount = 0;
    let semesterYear = year;
    let semesterCount = 0;

    // Semester and review calculation loop.
    for(let row = 0; row < rowCount; row++){
        tableContents[row] = {};

        const semester = month === 7
          ? 1 - row % 2
          : row % 2;

        meritCount += 1;
        let needsReview = false;
        let reviewType = '';
        let reviewYearFrom = year;
        let rowMonth = month;
        let semesterCountDisplay = '';

        if(row > 0 && semester === 0){
            semesterYear += 1;
        }
        let yearEffective = semesterYear;

        const semesterDisplay = semesters[semester] + ' ' + semesterYear;

        if(!document.getElementById('checkbox-' + row).checked){
            previousActiveSemester = semesterCount;
            semesterCount += 1;
            semesterCountDisplay = semesterCount;

            if(reviewCount === 0 && meritCount > 4){
                tableContents[previousActiveSemester]['needsReview'] = true;
                tableContents[previousActiveSemester]['reviewType'] = reviews[0];
                tableContents[previousActiveSemester]['yearEffective'] += 1;
                meritAdditional += 1;
                addMeritsToYear = false;

                for(var previousRow = 0; previousRow <= row - previousActiveSemester; previousRow++){
                    tableContents[previousActiveSemester + previousRow]['meritCount'] = previousRow;
                    meritCount = previousRow;
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
                    if(row > 3 && reviewCount < 1){
                        reviewCount += 1;
                    }
                    if(!addMeritsToYear){
                        yearEffective += 1;
                    }
                    if(month === 7){
                        reviewYearFrom += 1;

                    }else if(reviewCount < 2){
                        rowMonth = 7;
                    }
                    if(reviewCount === 2){
                        reviewYearFrom = midYear;
                        rowMonth = 1;
                        if(midYear !== false){
                            rowMonth = tableContents[midRow]['month'];
                            tableContents[midRow]['yearEffective'] += 1;
                        }
                    }
                }

                if(semesterCount === row + 1 && (semesterCount === reviewSemesters[0] || month === 7)){
                    yearEffective += 1;
                }

                meritCount = 0;
            }
        }

        if(addMeritsToYear){
            yearEffective += meritAdditional;
        }
        if(checkedBox > 3 && reviewCount > 1){
            yearEffective -= 1;
        }
        if(midYear === false && reviewCount === 2){
            midRow = row;
            midYear = semesterYear;
        }

        tableContents[row] = {
          'meritCount': meritCount,
          'month': rowMonth,
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
    for(const row in tableContents){
        let reviewString = '';
        const rowContents = tableContents[row];

        if(rowContents['needsReview']){
            reviewString = rowContents['reviewType'] + ' effective 7/1/' + rowContents['yearEffective']
              + ', due ' + rowContents['semesterDisplay'];

            let reviewDue = '6/30/' + rowContents['semesterYear'];
            if(rowContents['semester'] === 0){
                reviewString += ' (Spring case)';
                reviewDue = '12/31/' + (rowContents['semesterYear'] - 1);
            }
            reviewString += ', review period from ' + rowContents['month'] + '/1/' + rowContents['reviewYearFrom']
              + ' to ' + reviewDue;
        }

        document.getElementById('review-' + row).innerHTML = reviewString;
        document.getElementById('semesterCount-' + row).textContent = tableContents[row]['semesterCountDisplay'];
        document.getElementById('semester-' + row).textContent = tableContents[row]['semesterDisplay'];
    }

    // Update URL hash.
    let hash = '#' + year + ',' + month;
    for(let row = 0; row < rowCount; row++){
        if(document.getElementById('checkbox-' + row).checked){
            hash += ',' + (row + 1);
        }
    }
    globalThis.location.replace(hash);
}

let checkboxLimit = 4;
let checkedBox = 0;
let month = 0;
let rowCount = 16;
let year = 0;

window.onload = function(){
    const monthElement = document.getElementById('month');
    monthElement.onchange = function(){
        month = Number(this.value);
        updateTable();
    };
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
    for(let row = 0; row < rowCount; row++){
        tableRows += '<tr><td><input id=checkbox-' + row + ' type=checkbox>'
         + '<td class=center id=semesterCount-' + row + '>'
         + '<td id=semester-' + row + '>'
         + '<td id=review-' + row + '>';
    }
    document.getElementById('tableBody').innerHTML = tableRows;

    for(let row = 0; row < rowCount; row++){
        document.getElementById('checkbox-' + row).onchange = function(){
            updateCheckboxes(this.id);
        };
    }

    const hash = globalThis.location.hash;
    if(hash.length){
        const selected = hash.substring(1).split(',').map(function(i){
          return Number.parseInt(i, 10);
        });

        year = selected[0];
        yearElement.value = year;
        month = selected[1] || 7;
        monthElement.value = month;

        for(let i = 2; i < selected.length; i++){
            if(i >= 6){
                break;
            }
            if(selected[i] < 1 || selected[i] > 16){
                continue;
            }
            document.getElementById('checkbox-' + (selected[i] - 1)).checked = true;
            updateCheckboxes('checkbox-' + (selected[i] - 1));
        }

        updateTable();

    }else{
        resetAll();
    }
};
