// 【件名フォーマット（恐らく固定）】
// 【DMM英会話】レッスン予約完了のお知らせ

// 【予約内容フォーマット】
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ■　英会話 レッスン予約完了のお知らせ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 講師名：XXXX XXXX
// 講師Skype名：online.teacher.xxxxxx
// ご予約日：2015年11月04日
// 開始時間：21時30分

var CALENDAR_NAME = 'DMM_English_Lessons';
var MAIL_SEARCH_QUERY = 'newer_than:1d subject:"【DMM英会話】レッスン予約完了のお知らせ"';
var BODY_SEARCH_QUERY = '■　英会話 レッスン予約完了のお知らせ';

var EVENT_TITLE = '【DMM英会話】';

function registDmmCalendar() {

    // 指定したカレンダーを取得（無ければ作成）
    var calendars = CalendarApp.getCalendarsByName(CALENDAR_NAME);
    var calendar;
    if (calendars.length === 0) {
        calendar = CalendarApp.createCalendar(CALENDAR_NAME);
    } else {
        calendar = calendars[0];
    }

    var row = 1;
    // Gmailから指定文字列でスレッドを検索する
    var threads = GmailApp.search(MAIL_SEARCH_QUERY);

    // スレッドで繰り返し
    for (var i = 0; i < threads.length; i++) {
        // スレッド内のメッセージを取得
        var messages = threads[i].getMessages();

        // メッセージで繰り返し
        for (var j = 0; j < messages.length; j++) {

            // メッセージ本文
            var body = messages[j].getBody();
            var splitedBody = body.split("\n");

            for (var k = 0; k < splitedBody.length; k++) {
                // メール本文にDMM英会話のレッスン予約完了の旨が書いてあるかの確認を行う
                if (splitedBody[k].indexOf(BODY_SEARCH_QUERY) != -1) {

                    Logger.log("i:" + i);
                    Logger.log("j:" + j);
                    Logger.log("k:" + k);

                    // 講師名（skype名）
                    var str = splitedBody[k + 2];
                    var teacher_name = str.match(/講師名：([\s\.0-9a-zA-Z]+)/);
                    Logger.log(str + " -> " + teacher_name[1]);

                    var str = splitedBody[k + 3];
                    var teacher_skype = str.match(/講師Skype名：([\s\.0-9a-zA-Z]+)/);
                    Logger.log(str + " -> " + teacher_skype[1]);

                    // 予約日
                    str = splitedBody[k + 4];
                    var date = str.match(/(\d+)年+(\d+)月+(\d+)日/);
                    Logger.log(str + " -> " + date[1] + date[2] + date[3]);

                    // 開始時間
                    str = splitedBody[k + 5];
                    // var time = str.replace(/(\d+)時+(\d+)分/g, "$1:$2" );
                    var time = str.match(/(\d+)時+(\d+)分/);
                    Logger.log(str + " -> " + time[1] + time[2]);

                    var content = EVENT_TITLE + " " + teacher_name[1] + " (" + time[1] + ":" + time[2] + ")";
                    var date_arg = date[1] + "/" + date[2] + "/" + date[3];
                    var time_arg = time[1] + ":" + time[2];
                    // カレンダーに追加する
                    _addToCalendar(calendar, content, date_arg, time_arg);

                    break;
                }
            }

        }
    }
}

// カレンダーに追加する
// date : "yyyy/mm/dd"
// time : "hh:mm"
function _addToCalendar(calendar, content, date, time) {

    // イベントの日付
    var startDate = new Date(date + " " + time);
    var endDate = new Date(date + " " + time);
    endDate.setTime(endDate.getTime() + 30 * 60 * 1000 + 1);
    Logger.log(startDate);
    Logger.log(endDate);

    // その日のイベント
    var eventsForDay = calendar.getEvents(startDate, endDate);
    Logger.log(eventsForDay);
    var exsists = false;

    // 既存のイベントに存在するか確認する
    for (let l = 0; l < eventsForDay.length; l++) {
        // 存在したらフラグを立ててループを抜ける
        Logger.log('Title: ' + eventsForDay[l].getTitle());
        Logger.log('content: ' + content);
        Logger.log('calender: ' + eventsForDay[l].getTitle());

        if (content == eventsForDay[l].getTitle()) {
            Logger.log(exsists);

            exsists = true;
            break;
        }
    }

    // 既存のイベントが存在しなかった場合のみイベントを登録する
    if (!exsists) {
        Logger.log(date + " " + time);
        Logger.log(content);
        Logger.log(startDate);

        var event = calendar.createEvent(
            content,
            startDate,
            endDate
        );
        Logger.log('Event ID: ' + event.getId());
    }
}