$(document).ready(function() { 

    /********************************************************************************
        HTML grid creation
     *******************************************************************************/

    // sudoku dimension
    dim = 3;
    arrLen = dim * dim;

    size = 450 / arrLen;
    speed = 10;

    // create sudoku grid arrLen x arrLen
    for(var i = 0; i < arrLen; i++) {

        // create rows
        var small = '';
        small = "<tr id='i" + i + "'></tr>";
        $('.grid').append(small);

        // create cols
        var smallBox = '';
        for(var j = 0; j < arrLen; j++) {
            smallBox = "<td class='small-box' id='i" + i + "" + j + "'  style='";
            if(i % dim == 0 && i != 0) {
                smallBox += "border-top: 3px solid #007FFF; ";
            }
            if(j % dim == 0 && j != 0) {
                smallBox += "border-left: 3px solid #007FFF; ";
            }
            smallBox += "height: " + size + "px; width: " + size + "px;'></td>";
            $('#i' + i).append(smallBox);
            cell = "<input class='cell' maxlength='1' onClick='this.select()' id='" + getId(i, j) + "'>"
            $('#i' + i + "" + j).append(cell);
        }
    }

    /********************************************************************************
        Sudoku array
     *******************************************************************************/

    arr = new Array(arrLen);
    _arr = new Array(arrLen);

    for(var i = 0; i < arrLen; i++) {
        arr[i] = new Array(arrLen);
        _arr[i] = new Array(arrLen);
    }

    // initialize array
    for(var i = 0; i < arrLen; i++) {
        for(var j = 0; j < arrLen; j++) {
            arr[i][j] = 0;
            _arr[i][j] = false;
        }
    }

    /********************************************************************************
        CSS validations
     *******************************************************************************/

    var hilightColor = '#bed7df';
    var validColor = '#90EE90';
    var invalidColor = '#ffb6c1'
    var blankColor = '#ffffff';

    // Event listener - on cell select
    $('.cell').on('click', function() {
        var I = this.id.substring(1, 2);
        var J = this.id.substring(2, 3);
        
        clearColor();

        // highlight vertical - J is const
        for(var i = 0; i < arrLen; i++) {
            var Id = getId(i, J);
            if(Id != this.id && $('#' + Id).val() === '' || getBgColorHex($('#' + Id)) === blankColor) {
                $('#' + Id).css('background-color', hilightColor);
            }
        }

        // highlight horizontal - I is const
        for(var j = 0; j < arrLen; j++) {
            var Id = getId(I, j);
            if(Id != this.id && $('#' + Id).val() === '' || getBgColorHex($('#' + Id)) === blankColor) {
                $('#' + Id).css('background-color', hilightColor);
            }
        }

        // highlight sqare - I, J is const
        var Io = parseInt(I / dim) * dim;
        var Jo = parseInt(J / dim) * dim;
        
        for(var i = 0; i < dim; i++) { 
            for(var j = 0; j < dim; j++) {
                var Id = getId(i + Io, j + Jo);
                if(Id != this.id && $('#' + Id).val() === '' || getBgColorHex($('#' + Id)) === blankColor) {
                    $('#' + Id).css('background-color', hilightColor);
                }
            }
        }

    });

    // Event listener - on value input
    $('.cell').on('input', async function() {
        var ID = '#' + this.id;
        var val = $(ID).val();
        var pattern = /^[1-9]$/;
        if(val == '') {
            $(ID).css('background-color', '')
        } else if(!val.match(pattern)) {
            $(ID).val('');
        } else {
            clearColor();
            if(!checkValid(val, this.id)) {
                //$(ID).css('background-color', '');
                $(ID).css('background-color', invalidColor);
                $(ID).fadeOut(2000);
                setTimeout(function() {
                    $(ID).css('background-color', '');
                    $(ID).val('');
                    $(ID).fadeIn(1);
                }, 2000);
            }
        }
    });

    // Event listener - on cell blur
    $('.cell').on('focusout', function() {
        clearColor('');
    });

    // Event listener - on cell blur
    $('#load').on('click', function() {

        // question set
        var ques = [
            '8-94----31--8--7---4--751----7--3-6962-----4--3-5-82--4-1--2-3-2-3---5-8-6--89--1',
            '2-1--8-65---4-379-----2---179---42---6-7-1-83--53------5-2--648-4--573--3-98---5-',
            '7--9----1-8--2--6--4-8-5----9-6--5-----179---2-----37-8-2-51-97-6479-2-5--5--8-43',
            '--19---7-----6-32-85---4-6-9---28--54---7-9----31-68-7--6-57--3-7----2-12-9813---',
            '-32-64---9--5----74--9-13-6----2--5-8--71-2-9--43-8-------9-5--5-76---18-6-28----',
            '5--3-14---8157------------23--1----9--2-9-3-5--472-----46-85-2--9-4--61-87-----9-',
            '3--59--68-8----29-5-2-1-4--41--5-8---5-326-----9----7--34----8-8-1--46--62---73-1',
            '-----4--16-----23-35-1---79-157-86--9---3-78---8-9-1-2-9---2-54----798--4--51--2-',
            '--6-3--1-3--6-5----7--29----2-3--984794---3-------1--553---82---69-47----412--59-',
            '-59---2-1---8---9---31-7--429----3-5----8-46-16-2-5-8-5----31--4---6-7-8-374---2-',
            '835-2--41-2-----39-4-81-----869-----2-1--47--9-----286---356--7-9--4-3--5----7-1-',
            '-5---746---9-32--7--24-63--76--8---33---9187-4------15-1-2-----5-617---8-84--5-9-',
            '--493--188-5-------9--4--7-3-2-57------1---6471-89---5--9-6----4315------6-489-32',
            '-632-41-5-4---3-92---9---8-53--9-8--1---6---7--4--73--31-87--6-27-1-5-----8--2-5-',
            '9--86---4-2---5---85-793---57--8-----914-7-2-------35--8-6--139--6---842---23--6-',
            '9--26----2-7--8--5-15-9-4--7----6----5--1---3-8-934-711-6------32-----87-7-42--39',
            '--1-----48-32----9-2-4-63-7-16--3-9-7----18---8452-7--4---9-5---5--6--2---978--41',
            '----79-6---2--57-318--2--4--296-1---7--25--18-4----3-------3-9139-4--6-76-5-8----',
            '5--7---296---1584--8-94---3--2----169-4----5-76---12--83-2-7-9--9--8--72--1-3----',
            '-8-29-6--6--4---393--75--21-7------8938-4--5---2--9--7---6--74--5---81-3-16-2---5',
            '6-92-358-57------4-4--1--9-8----64-----3---5-----791-3-21-9-7---3-48-9-5---7-26--',
            '-7-------95---28---1-89--34--7---1984--3695----2-7-6----8-36-57----21----654-7-1-',
            '--95864---279--5----6--41--94-3-1-2---3-65-9--7----8---612----75--63--8------935-',
            '--86-2-----17--43-47---5------451--33-2-----8-6----97-2---9461-6--5-7-82713----9-',
            '--596--7-4---31-2-1-67-5--89--4-8-6---2-138---58------2---96--7--7-2-615--3-----4',
            '78--1-3-----96-5----5--264---73---644-1-----28----173--9275---835----97-1--6-4---',
            '-5-1-78---41------69--4-5-33--8-2-9-9-4-15-3-76--3-1-5------74917---6-----8-5--2-',
            '37-4-1--2----875----15934-6-8-1----9-16---3--7--92--1---9-5-64-25---8-9-4--3----7',
            '--6439--8--5---2---9-58--76---2451---18--7---3-----9-79-2---73--876--45--4-9-1--2',
            '82--9-3-4--5-2--91-7--358--6----7-289-4-6------7--9--5-3---1----9-24--76--6-5-21-',
            '-29---58-6--32-4-71--8---------6-3-1-71--4-6----23--9---465---9783-1---559-----72',
            '------2----7456---3-1--7---98--1--63---3-594-4-27---8---8-----76---9152-2-46--89-',
            '1----85-----3-7-897--6--2---9--5-1-342--6-97-35-2---4---2-----8---4-961-6--57---4',
            '7-1-2--8-----1---4-9-3-5-----98--24-16--7----52-9-4-3------2-9--831-65-7-5-4-76-8',
            '8-----96--7-59---3--32-8-15--23-4--8--1-82-----6---47--4---93---3--51-2-5--82-6-9',
            '29-------1-4-5-68-----489-39-1874-----6----5-8-3-2-1---75-1---46-----23--8--39--6',
            '--14-5---78--31-5-----8---9-278---1--4----62-69-2--57---4--73--5-369-24--1---38--',
            '-47----9---52--81612--564-------8--7591--43--8-3--1------6395--2--47---83-9-8--6-',
            '91--8--3--4629-1-------7--4---3---5112--4-869654----2-37-5---8----6----3--29-174-',
            '---47-8--2--9-541--------3-7-1---38--45--79--68--3--25-----91-6-93-42-7-5-4-8----',
            '-34-2156-1--8-----6---7-3--5---1--9--68--9-----27--634-87--6--22--5--4-3--1-948--',
            '--3--2-5---789---1--6--59--51--6--48--9-4-7---4-531--2-8------42--1-98-63617---2-',
            '---9-6-5767--3----------61--------3--84-571---9-8-----7----142--1--6937--2-4-356-',
            '69-4-5-7---49-----8-576-429-461---32----9---55-3284--6351---------83-25-28----6--',
            '--43--2-9--5--9--1-7--6--43--6--2-8719---74---5--83---6-----1-5--35-869--4291-3--',
            '-4-1---5-1-7--396-52---8----------17---9-68--8-3-5-62--9--6-5436---8-7--25--971--',
            '6--12-384--8459-72-----6--5---264-3--7--8---694---3---31-----5--897-----5-2---19-',
            '4972-----1--4----5----16-9862-3---4-3--9-------1-726----2--587----6----453--97-61',
            '--591-3-8--94-3-6--275--1---3----2-1---82---7--6--7--4----8----64-15-7--89----42-',
            '1----5--738-9-----6-----48-82---1-75-4-76--2--69--2--1--5-39--4----2-1------46352',
            '--9-6543---7---8--6--1-8-2---3-9---25-14-396-8-4---1---3-5-9--7-56-8-----7-24--9-',
            '------6577-24--1--35---6---5---2---921-3--5---471-9--8--876--9-9--5-2-3--3--182-6',
            '5-3-7-19------675--4719-6--4---38---95-2--3------1--72---8-4--13----186--8672---5',
            '-6-72-9-8-84--3--17--1---659----8----71-6------2-1--34---2--7-6-3--498--215----9-',
            '--4-83--2-51--43------9671-12-8----6-4----5--83-6-79---6-3-9-4---7---2-5-9--5-8-3',
            '----6-28-7-9--1---86-32--749---4-51---719-34---3--6--2--297----3--8--9-55------21',
            '--43-----89-2--67-7--9---5-5----814--7--32-6-6----13-8--175-9----5-4--1298---6--5',
            '--8-7-1--12--9--54-----3-2-6-4-1--8953-78--1---9-623---8--4-6-7--75-6---4--8----2',
            '-6537---2-----137----64-8---97--4-28-8--9---11---2-94--4---67---7--18-5-23-9---6-',
            '--571-329---3628----4------1-----98--839--25---6--31--3--1-6---4-98----7-7--295--',
            '2----53------7385----1-89-4-7---9--1651----4--4-2---8-3---5----58-76-1--41--3--96',
            '-4-8--5---8-76--92--1--547--563-9-----9--1--432-5---1----2--7--7---9--3---5--8-26',
            '-5--83-17---1--4--3-4--56-8----3---9-9-8245----6----7---9----5---729--861-36-72-4',
            '7---84--53--7-1-2--8-26-4-16241-9-388-36---1---------29----------1--579--354----6',
            '-67-5--1--843-9-----3-8--4--9----2-5---62179-7---936--3--4------2---71535--8---76',
            '--14-9-3----3-6-52--7--819--6--2-8-------3-658945-7---4-3-91-8--79-4--26---7--9--',
            '2-6-3------1-65-7--471-8-5-5------29--8-194-6---42---1----428--6-93----5-7-----13'
        ];

        // load and display
        loadQues('---------------------------------------------------------------------------------');
        var n = Math.round(Math.random() * (ques.length - 1));
        $('#set').text('Puzzle set #' + (n + 1));
        loadQues(ques[n]);
        display();
    });

    // Event listener - on solve button
    $('#solve').on('click', function() {

        if(!isSolved()) {
            fetch();
            // solve
            var solCount = 0;

            while (!isSolved()) {
                solve();
                solveVer();
                solveHor();
                solveSquare();
                solCount++;
                if(solCount >= 10) {
                    break;
                }
            }
            display();
            console.log('Solved - ' + solCount);
        } else {
            alert('Already Solved');
        }

    });

    // clear highlight color
    function clearColor() {
        var id = '';
        for(var i = 0; i < arrLen; i++) {
            for(var j = 0; j < arrLen; j++) {
                id = '#' + getId(i, j);
                if(getBgColorHex($(id)) === hilightColor)
                    $(id).css('background-color', '');
            
            }
        }
    }

    function getBgColorHex(elem){
        var color = elem.css('background-color')
        var hex;
        if(color.indexOf('#')>-1){
            //for IE
            hex = color;
        } else {
            var rgb = color.match(/\d+/g);
            hex = '#'+ ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2);
        }
        return hex;
    }

    // construct id of cell
    function getId(i, j) {
        return 'a' + i + j;
    }

    /********************************************************************************
        Sudoku validations
     *******************************************************************************/

    function checkValid(val, ID) {
        var I = ID.substring(1, 2);
        var J = ID.substring(2, 3);

        return checkHorizontal(val, ID, I) && checkVertical(val, ID, J) && checkSquare(val, ID, I, J);
    }

    // check horizontal - I is const
    function checkHorizontal(val, ID, I) {
        for(var j = 0; j < arrLen; j++) {
            var Id = getId(I, j);
            if(ID != Id && $('#' + Id).val() == val) {
                return false;
            }
        }
        return true;
    }

    // check vertical - J is const
    function checkVertical(val, ID, J) {
        for(var i = 0; i < arrLen; i++) {
            var Id = getId(i, J);
            if(ID != Id && $('#' + Id).val() == val) {
                return false;
            }
        }
        return true;
    }

    // check sqare - I, J is const
    function checkSquare(val, ID, I, J) {
        var Io = parseInt(I / dim) * dim;
        var Jo = parseInt(J / dim) * dim;
        for(var i = 0; i < dim; i++) { 
            for(var j = 0; j < dim; j++) {
                var Id = getId(i + Io, j + Jo);
                if(ID != Id && $('#' + Id).val() == val) {
                    return false;
                }
            }
        }
        return true;
    }

    /********************************************************************************
        Sudoku solving algorithm
     *******************************************************************************/

    function solve() {
        for(var i = 0; i < arrLen; i++) {
            for(var j = 0; j < arrLen; j++) {
                if(arr[i][j] == 0) {
                    var count = 0;
                    var vac = 0;
                    // loop through 1-9
                    for(var num = 1; num < (arrLen + 1); num++) {
                        if(isPossible(num, i, j)) {
                            vac = num;
                            count++;
                        }
                    }
                    if(count == 1) {
                        arr[i][j] = vac;
                        //$('#' + getId(i, j)).val(arr[i][j]);
                    }
                }
            }
        }
    }

    function solveHor() {

        // loop through horizontal lines
        for(var i = 0; i < arrLen; i++) {
            // for each number 1-9
            for(var num = 1; num < (arrLen + 1); num++) {
                // check if element exist in horizontal line
                if(!hasElementHor(num, i)) {
                    var numPossibility = 0;
                    var jIndex = -1;
                    for(var j = 0; j < arrLen; j++) {
                        if(arr[i][j] == 0 && isPossible(num, i, j)) {
                            jIndex = j;
                            numPossibility++;
                        }
                    }
                    if(numPossibility == 1) {
                        arr[i][jIndex] = num;
                        //_arr[i][jIndex] = true;
                        //$('#' + getId(i, jIndex)).val(arr[i][jIndex]);
                    }
                }
            }
        }
    }

    function solveVer() {

        // loop through vertical lines
        for(var j = 0; j < arrLen; j++) {
            // for each number 1-9
            for(var num = 1; num < (arrLen + 1); num++) {
                // check if element exist in horizontal line
                if(!hasElementVer(num, j)) {
                    var numPossibility = 0;
                    var iIndex = -1;
                    for(var i = 0; i < arrLen; i++) {
                        if(arr[i][j] == 0 && isPossible(num, i, j)) {
                            iIndex = i;
                            numPossibility++;
                        }
                    }
                    if(numPossibility == 1) {
                        arr[iIndex][j] = num;
                        //_arr[iIndex][j] = true;
                        //$('#' + getId(iIndex, j)).val(arr[iIndex][j]);
                    }
                }
            }
        }
    }

    function solveSquare() {
        box = [
            [0, 0],
            [0, 3],
            [0, 6],
            
            [3, 0],
            [3, 3],
            [3, 6],
            
            [6, 0],
            [6, 3],
            [6, 6]
        ];

        for(var b = 0; b < arrLen; b++) {
            var I = box[b][0];
            var J = box[b][1];
            //alert('(' + I + ',' + J + ')');
            for(var num = 1; num < (arrLen + 1); num++) {
                // check if element exist in horizontal line
                if(!hasElementSqr(num, I, J)) {
                    var numPossibility = 0;
                    var iIndex = -1;
                    var jIndex = -1;
                    for(var i = 0; i < dim; i++) {
                        for(var j = 0; j < dim; j++) {
                            if(arr[i + I][j + J] == 0 && isPossible(num, i + I, j + J)) {
                                iIndex = i + I;
                                jIndex = j + J;
                                numPossibility++;
                            }
                        }
                    }
                    if(numPossibility == 1) {
                        arr[iIndex][jIndex] = num;
                        //_arr[iIndex][jIndex] = true;
                        //$('#' + getId(iIndex, jIndex)).val(arr[iIndex][jIndex]);
                    }
                }
            }
        }
    }

    function hasElementHor(num, I) {
        for(var j = 0; j < arrLen; j++) {
            if(arr[I][j] == num) {
                return true;
            }
        }
        return false; 
    }

    function hasElementVer(num, J) {
        for(var i = 0; i < arrLen; i++) {
            if(arr[i][J] == num) {
                return true;
            }
        }
        return false;
    }

    function hasElementSqr(num, I, J) {
        for(var i = 0; i < dim; i++) {
            for(var j = 0; j < dim; j++) {
                if(arr[i + I][j + J] == num) {
                    return true;
                }
            }
        }
        return false;
    }

    function isPossible(num, I, J) {
        return posHorizontal(num, I) && posVertical(num, J) && posSquare(num, I, J);
    }

    // check horizontal - I is const
    function posHorizontal(num, I) {
        for(var j = 0; j < arrLen; j++) {
            if(arr[I][j] == num) {
                return false;
            }
        }
        return true;
    }

    // check vertical - J is const
    function posVertical(num, J) {
        for(var i = 0; i < arrLen; i++) {
            if(arr[i][J] == num) {
                return false;
            }
        }
        return true;
    }

    // check sqare
    function posSquare(num, I, J) {
        var Io = parseInt(I / dim) * dim;
        var Jo = parseInt(J / dim) * dim;
        for(var i = 0; i < dim; i++) { 
            for(var j = 0; j < dim; j++) {
                if(arr[i + Io][j + Jo] == num) {
                    return false;
                }
            }
        }
        return true;
    }

    function isSolved() {
        for(var i = 0; i < arrLen; i++) { 
            for(var j = 0; j < arrLen; j++) {
                if(arr[i][j] == 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function loadQues(quesString) {
        $(".cell").removeAttr('disabled');
        var c = 0;
        for(var i = 0; i < arrLen; i++) { 
            for(var j = 0; j < arrLen; j++) {
                var v = quesString.charAt(c++);
                if(v != '-') {
                    arr[i][j] = parseInt(v);
                    _arr[i][j] = true;
                } else {
                    arr[i][j] = 0;
                    _arr[i][j] = false;
                }
            }
        }
    }

    function fetch() {
        // fetch from html
        for(var i = 0; i < arrLen; i++) {
            for(var j = 0; j < arrLen; j++) {
                var val = $('#' + getId(i, j)).val();
                if(val != '' && checkValid(val, getId(i, j))) {
                    arr[i][j] = parseInt(val);
                    _arr[i][j] = true;
                } else {
                    arr[i][j] = 0;
                    _arr[i][j] = false;
                }
            }
        }
    }

    function display() {
        //$(".cell").attr('disabled','disabled');
        // display in html
        for(var i = 0; i < arrLen; i++) {
            for(var j = 0; j < arrLen; j++) {
                if(arr[i][j] != 0) {
                    $("#" + getId(i, j)).attr('disabled','disabled');
                    if(_arr[i][j]) {
                        //$('#' + getId(i, j)).css('background-color', validColor);
                        $('#' + getId(i, j)).val(arr[i][j]);
                    } else {
                        $('#' + getId(i, j)).fadeOut(1);
                        $('#' + getId(i, j)).val(arr[i][j]);
                        $('#' + getId(i, j)).fadeIn("slow", "swing");
                        //await sleep(speed);
                        //$('#' + getId(i, j)).val(arr[i][j]);
                    }
                } else {
                    $('#' + getId(i, j)).val('');
                }
                if(_arr[i][j]) {
                    $('#' + getId(i, j)).css('background-color', validColor);
                } else {
                    $('#' + getId(i, j)).css('background-color', '');
                }
            }
        }
    }

});