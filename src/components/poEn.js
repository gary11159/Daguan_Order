import React from 'react';
import firebase from 'firebase';
import config from '../config/config';
import Form from './form';
import Spinner from './spinner';
import HistoryCheck from './historyCheck';
import Logo_EX from '../public/logo_EX.png';
import Logo_COW from '../public/logo_Cow.png';
import Title from '../public/title.png';

class ComponentToPrint extends React.Component {
    constructor(props) {
        super(props);
    }

    // 處理換行
    handlerEnter(content) {
        let snArray = [];
        snArray = content.split('\n');

        let br = <br></br>;
        let result = null;
        if (snArray.length < 2) {
            return content;
        }

        for (let i = 0; i < snArray.length; i++) {
            if (i == 0) {
                result = snArray[i];
            } else {
                result = <span>{result}{br}{snArray[i]}</span>;
            }
        }
        return result;
    }

    render() {
        return (
            <div style={this.props.boldOrNot ? { fontSize: '30px', fontWeight: '500' } : { fontSize: '30px', fontWeight: '500' }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                    <img src={Title} style={{ width: '100%' }} alt="logo"></img>
                </div>
                <table className="print" style={this.props.boldOrNot ? { width: 'calc(100% - 10px)', margin: '0 auto', marginTop: '10px' } :
                    { width: 'calc(100% - 10px)', margin: '0 auto', marginTop: '10px', bottom: '15px', position: 'relative' }} >
                    <tbody>
                        <tr>
                            <td style={{ width: '30%' }}>日期</td>
                            <td>{this.props.dateTime}</td>
                        </tr>
                        <tr>
                            <td>編號</td>
                            <td>{this.props.number}</td>
                        </tr>
                        <tr>
                            <td>承辦業務</td>
                            <td>{this.props.sale}</td>
                        </tr>
                        <tr>
                            <td>廠商</td>
                            <td>{this.props.factory}</td>
                        </tr>
                        <tr>
                            <td>廠商名稱</td>
                            <td>{this.props.name}</td>
                        </tr>
                        <tr>
                            <td>廠商電話</td>
                            <td>{this.props.phone}</td>
                        </tr>
                        <tr>
                            <td>施工時間</td>
                            <td>{this.props.workTime}</td>
                        </tr>
                        <tr>
                            <td style={{ height: '100px' }}>施工地址</td>
                            <td>{this.handlerEnter(this.props.address)}</td>
                        </tr>
                        <tr>
                            <td>金額</td>
                            <td>{this.props.money}</td>
                        </tr>
                        <tr>
                            <td style={{ height: '60px' }}>客戶簽收</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ height: '60px' }}>備註</td>
                            <td>{this.handlerEnter(this.props.other)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}


function PoEn() {
    const componentRef = React.useRef();
    const printRef = React.useRef();
    const [curTab, setCurTab] = React.useState("tab1");
    const [number, setNumber] = React.useState(1);
    const [dateTime, setDateTime] = React.useState(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate());
    const [sale, setSale] = React.useState("");
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [money, setMoney] = React.useState("");
    const [other, setOther] = React.useState("");
    const [factory, setFactory] = React.useState("");
    const [workTime, setWorktime] = React.useState("");
    const [database, setDatabase] = React.useState();
    const [loadingStatus, setLoadingStatus] = React.useState(false);
    const [futureNum, setFutureNum] = React.useState();
    const [from, setFrom] = React.useState("now");  // 判斷預開選項是否打開
    const [secretNum, setSecretNum] = React.useState(0);
    const [chooseDate, setChooseDate] = React.useState(); // 預開編號的日期

    // 找到空隙
    function findEmpty(arr) {
        for (let i = 0; i < arr.length; i++) {
            // 如果是最後一位，直接return最後一位數字+1
            if (i === arr.length - 1) {
                return +arr[i] + 1;
            }
            // 有空隙的，如[1,2,5] 回傳3
            else if (+arr[i] < +arr[i + 1] && +arr[i] + 1 < +arr[i + 1]) {
                return +arr[i] + 1;
            }
        }

        return 1;
    }

    // 清空欄位
    function initData() {
        setSale("");
        setName("");
        setAddress("");
        setPhone("");
        setMoney("");
        setOther("");
        setFactory("");
        setWorktime("");
    }

    // 初始化資料庫
    React.useEffect(() => {
        setLoadingStatus(true);
        let app = firebase.initializeApp(config);
        let database = app.database();
        setDatabase(database);
    }, []);

    React.useEffect(() => {
        if (database !== undefined && database !== null && database !== "") {
            // 當前月份
            const path = '/' + (new Date().getFullYear()) + (new Date().getMonth() + 1);
            refreshNumber(path);
        }
    }, [database, curTab]);

    function refreshNumber(path) {
        setLoadingStatus(true);
        database.ref(path).on("value", e => {
            if (e === null || e === undefined) {
                setLoadingStatus(false);
                alert("資料庫發生錯誤，請稍後再試或是通知管理員");
                console.error(e)
            }
            else {
                let data = e.val();
                if (data !== undefined && data !== null) setNumber(findEmpty(Object.keys(data)));
                setLoadingStatus(false);
            }

        })
        // .catch(function(e) {
        //     setLoadingStatus(false);
        //     alert("資料庫發生錯誤，請稍後再試或是通知管理員");
        //     console.error(e)
        // })
    }

    async function saveData(e, date) {
        // 當前月份
        let path;
        // 要儲存的num
        let _num = from === "now" ? number : futureNum;
        if (from === "now") {
            path = '/' + (new Date().getFullYear()) + (new Date().getMonth() + 1);
        }
        else {
            path = '/' + (date.getFullYear()) + (date.getMonth() + 1);
        }
        setLoadingStatus(true);
        await database.ref(path).update({
            [_num]: {
                address,
                dateTime,
                money,
                name,
                other,
                phone,
                sale,
                factory,
                workTime,
                'updateTime': new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()
            }
        }).then(function () {
            setLoadingStatus(false);
            refreshNumber(path);
            initData();
        }).catch(function () {
            setLoadingStatus(false);
            alert("資料庫發生錯誤，請稍後再試或是通知管理員");
            e.preventDefault();
        });
    }
    function handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        if (name === 'number') setNumber(value);
        else if (name === 'dateTime') setDateTime(value);
        else if (name === 'sale') setSale(value);
        else if (name === 'factory') setFactory(value);
        else if (name === 'workTime') setWorktime(value);
        else if (name === 'name') setName(value);
        else if (name === 'address') setAddress(value);
        else if (name === 'phone') setPhone(value);
        else if (name === 'money') setMoney(value);
        else if (name === 'other') setOther(value);
    }

    React.useEffect(() => {
        if (secretNum === 5 && from === "now") {
            setFrom("future");
            setSecretNum(0);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            const path = '/' + (new Date().getFullYear()) + (new Date().getMonth() + 1);
            refreshNumber(path);
        } else if (secretNum === 5 && from === "future") {
            setFrom("now");
            setSecretNum(0);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            const path = '/' + (new Date().getFullYear()) + (new Date().getMonth() + 1);
            refreshNumber(path);
        }
    }, [secretNum]);

    // 轉換編號成正式格式
    function convertNum(num) {
        let month;
        if (from === "now") {
            month = (new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
            if (num < 10) {
                return (new Date().getFullYear() - 1911) + "" + month + '00' + num;
            } else if (num < 100) {
                return (new Date().getFullYear() - 1911) + "" + month + '0' + num;
            } else {
                return (new Date().getFullYear() - 1911) + "" + month + "" + num;
            }
        } else if (from === "future") {
            if (chooseDate === undefined || chooseDate === null || chooseDate === "") return;
            month = (chooseDate.getMonth() + 1) < 10 ? '0' + (chooseDate.getMonth() + 1) : (chooseDate.getMonth() + 1);
            if (num < 10) {
                return (chooseDate.getFullYear() - 1911) + "" + month + '00' + num;
            } else if (num < 100) {
                return (chooseDate.getFullYear() - 1911) + "" + month + '0' + num;
            } else {
                return (chooseDate.getFullYear() - 1911) + "" + month + "" + num;
            }
        }
    }

    return (
        <>
            {loadingStatus &&
                <Spinner />
            }

            <div className="tabs" style={{ width: '70%' }}>
                <div className="tab-2" style={curTab === 'tab1' ? { zIndex: 9 } : null}>
                    <label htmlFor="tab2-1">當前列印</label>
                    <input id="tab2-1" name="tabs-two" type="radio" defaultChecked onClick={() => setCurTab("tab1")} />
                    <Form
                        database={database}
                        handleChange={(e) => handleChange(e)}
                        number={number}
                        componentRef={componentRef}
                        printRef={printRef}
                        dateTime={dateTime}
                        phone={phone}
                        money={money}
                        sale={sale}
                        address={address}
                        other={other}
                        factory={factory}
                        workTime={workTime}
                        name={name}
                        saveData={(date, num) => saveData(date, num)}
                        setLoadingStatus={(status) => setLoadingStatus(status)}
                        from={from}
                        setPrintNum={(num) => setFutureNum(num)}
                        setChooseDate={(date) => setChooseDate(date)}
                    />
                </div>
                <div className="tab-2" style={curTab === 'tab2' ? { zIndex: 9 } : null}>
                    <label htmlFor="tab2-2">歷史資料列印</label>
                    <input id="tab2-2" name="tabs-two" type="radio" onClick={() => setCurTab("tab2")} />
                    <HistoryCheck database={database} curTab={curTab} refreshNumber={(path) => refreshNumber(path)} setLoadingStatus={(status) => setLoadingStatus(status)} />
                </div>
            </div>

            <div style={{ overflow: 'hidden', height: 0 }}>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                    {/* <div style={{ width: '100%' }}> */}
                    <ComponentToPrint style={{ overflow: 'hidden', height: 0 }}
                        number={from === "now" ? convertNum(number) : convertNum(futureNum)}
                        dateTime={dateTime}
                        boldOrNot={true}
                        factory={factory}
                        workTime={workTime}
                        name={name}
                        phone={phone}
                        money={money}
                        sale={sale}
                        address={address}
                        other={other}
                        ref={el => (componentRef.current = el)} />
                </div>
            </div>
            <div style={{ overflow: 'hidden', height: 0, width: 450 }}>
                <div ref={printRef} style={{ backgroundColor: 'white', color: 'black' }}>
                    {/* <div style={{ width: '100%' }}> */}
                    <ComponentToPrint style={{ overflow: 'hidden', height: 0 }}
                        number={from === "now" ? convertNum(number) : convertNum(futureNum)}
                        boldOrNot={false}
                        dateTime={dateTime}
                        factory={factory}
                        workTime={workTime}
                        name={name}
                        phone={phone}
                        money={money}
                        sale={sale}
                        address={address}
                        other={other} />
                </div>
            </div>
            <div id="footer">
                <footer className="footer allCenter" style={{ marginTop: '10px' }}>
                    <img src={Logo_EX} style={{ width: '50px' }} onClick={() => setSecretNum(secretNum + 1)} alt="logo"></img>
                    <span style={{ fontSize: '20px', margin: '0 30px' }}>
                        © 2020 by Gary Yang. Created by React Framework
                    </span>
                    <img src={Logo_COW} style={{ width: '50px' }} alt="logo"></img>
                </footer>
            </div>
        </>
    );
}

export default PoEn;
