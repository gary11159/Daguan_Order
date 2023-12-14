import React, { useCallback } from 'react';
import Form from './form';
import DatePicker, { registerLocale } from "react-datepicker";
import noti from '../public/noti.png';
import ja from 'date-fns/locale/ja';
import { Space } from 'antd';
import Title from '../public/title.png';
import { toPng } from 'html-to-image';
registerLocale('ja', ja)

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
            <div style={{ fontSize: '30px' }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                    <img src={Title} style={{ width: '100%' }} alt="logo"></img>
                </div>
                <table className="print" style={{ width: 'calc(100% - 10px)', margin: '0 auto', marginTop: '10px' }}>
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
        );
    }
}

function HistoryCheck(props) {
    const ref = React.useRef();
    const componentRef = React.useRef();
    const printRef = React.useRef();
    const [firstIn, setFirstIn] = React.useState(true)
    const [dataPrint, setDataPrint] = React.useState();
    const [numberPicker, setNumberPicker] = React.useState();
    const [chooseNumber, setChooseNumber] = React.useState();
    const [chooseDate, setChooseDate] = React.useState();
    const [selectOption, setSelectOption] = React.useState("default");

    const [dateTime, setDateTime] = React.useState("");
    const [sale, setSale] = React.useState("");
    const [factory, setFactory] = React.useState("");
    const [workTime, setWorktime] = React.useState("");
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [money, setMoney] = React.useState("");
    const [other, setOther] = React.useState("");

    async function initData() {
        setSelectOption("default");
        setDateTime("");
        setSale("");
        setName("");
        setAddress("");
        setPhone("");
        setMoney("");
        setOther("");
        setChooseNumber("");
        setFactory("");
        setWorktime("");
    }

    async function handlerDatePickerChange(date) {
        setChooseDate(date);
        setFirstIn(false);
        if (date === '' || date === undefined || date === null) {
            setDataPrint();
            setNumberPicker();
            return;
        }
        await initData();
        const path = date.getFullYear() + "" + (date.getMonth() + 1);
        setSelectOption("default");
        props.setLoadingStatus(true);
        props.database.ref(path).once("value", e => {
            let data = e.val();
            if (data === undefined || data === null || data === '') {
                initData();
                setDataPrint();
                setNumberPicker();
            } else {
                setNumberPicker(Object.keys(data));
                setDataPrint(data);
            }
            props.setLoadingStatus(false);
        })
            .catch(function (e) {
                props.setLoadingStatus(false);
                alert("資料庫發生錯誤，請稍後再試或是通知管理員");
                console.error(e)
            })
    }

    React.useEffect(() => {
        if (chooseDate !== "" && chooseDate !== undefined && chooseDate !== null)
            handlerDatePickerChange(chooseDate);
    }, [props.curTab])

    function handlerNumberChange(e) {
        if (e.target.value !== 'default') {
            setSelectOption(e.target.value);
            setChooseNumber(e.target.value);
            let data = dataPrint[e.target.value];
            setDateTime(data.dateTime);
            setSale(data.sale);
            setName(data.name);
            setAddress(data.address);
            setPhone(data.phone);
            setMoney(data.money);
            setOther(data.other);
            setFactory(data.factory === undefined ? "" : data.factory);
            setWorktime(data.workTime === undefined ? "" : data.workTime);
        } else {
            initData();
        }
    }

    async function saveData(e) {
        // 歷史月份
        const path = '/' + chooseDate.getFullYear() + (chooseDate.getMonth() + 1);
        dataPrint[chooseNumber] = {
            address,
            dateTime,
            money,
            name,
            other,
            phone,
            sale,
            factory,
            workTime
        }
        setDataPrint(dataPrint);
        props.setLoadingStatus(true);
        let jsonData = {
            [chooseNumber]: {
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
        }
        await props.database.ref(path).update(
            // 會用JSON Parse是用來剔除undefined(一般發生在新欄位產生)
            JSON.parse(JSON.stringify({
                [chooseNumber]: {
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
            }))
        ).then(function () {
            props.setLoadingStatus(false);
            props.refreshNumber(path);
        }).catch(function () {
            props.setLoadingStatus(false);
            alert("資料庫發生錯誤，請稍後再試或是通知管理員");
            e.preventDefault();
        });
    }

    function handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        if (name === 'dateTime') setDateTime(value);
        else if (name === 'sale') setSale(value);
        else if (name === 'name') setName(value);
        else if (name === 'address') setAddress(value);
        else if (name === 'phone') setPhone(value);
        else if (name === 'money') setMoney(value);
        else if (name === 'other') setOther(value);
        else if (name === 'factory') setFactory(value);
        else if (name === 'workTime') setWorktime(value);
    }

    // 轉換編號成正式格式
    function convertNum(num) {
        if (chooseDate === undefined || chooseDate === null || chooseDate === "") return;
        let month = (chooseDate.getMonth() + 1) < 10 ? '0' + (chooseDate.getMonth() + 1) : (chooseDate.getMonth() + 1);
        if (num < 10) {
            return (chooseDate.getFullYear() - 1911) + "" + month + '00' + num;
        } else if (num < 100) {
            return (chooseDate.getFullYear() - 1911) + "" + month + '0' + num;
        } else {
            return (chooseDate.getFullYear() - 1911) + "" + month + "" + num;
        }
    }

    return (
        <>
            <Space direction="vertical">
                <div className="row" className={numberPicker !== undefined ? "elementAlignCenter" : null}>
                    <div className={numberPicker !== undefined ? "col-50" : null}>
                        <DatePicker
                            placeholderText="請選擇日期"
                            selected={chooseDate}
                            onChange={date => handlerDatePickerChange(date)}
                            dateFormat="yyyy年MM月"
                            showDisabledMonthNavigation
                            showMonthYearPicker
                            locale={'ja'}
                        />
                    </div>
                    {numberPicker !== undefined &&
                        <div className="col-50">
                            <div className="row">
                                <div className="col-25">
                                    <label htmlFor="subject">編號:</label>
                                </div>
                                <div className="col-75">
                                    <select id="country" name="country" onChange={(e) => handlerNumberChange(e)} ref={ref} value={selectOption}>
                                        <option value="default" key="default">--請選擇編號--</option>
                                        {numberPicker !== undefined && numberPicker.length > 0 && numberPicker.map((num) => {
                                            return (
                                                <option value={num} key={num}>{num}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                    }
                    {!firstIn && numberPicker === undefined && dataPrint === undefined &&
                        <div className="row" className="allCenter" style={{ marginTop: '30px' }}>
                            <img src={noti} style={{ marginRight: '15px', width: '1.5em' }} alt="warn"></img>
                            <span>查無資料</span>
                        </div>
                    }
                </div>
                {dataPrint &&
                    <>
                        <Form
                            handleChange={(e) => handleChange(e)}
                            componentRef={componentRef}
                            printRef={printRef}
                            number={chooseNumber}
                            dateTime={dateTime}
                            address={address}
                            sale={sale}
                            name={name}
                            phone={phone}
                            money={money}
                            other={other}
                            factory={factory}
                            workTime={workTime}
                            historyChooseDate={chooseDate}
                            saveData={() => saveData()}
                            from="history"
                            setLoadingStatus={(status) => props.setLoadingStatus(status)}
                        />
                        <div style={{ overflow: 'hidden', height: 0, width: 320 }} >
                            <div ref={printRef} style={{backgroundColor: 'white', color: 'black'}}>
                                {/* <div style={{ width: '100%' }}> */}
                                <ComponentToPrint
                                    number={convertNum(chooseNumber)}
                                    dateTime={dateTime}
                                    name={name}
                                    phone={phone}
                                    money={money}
                                    sale={sale}
                                    address={address}
                                    other={other}
                                    factory={factory}
                                    workTime={workTime}
                                    ref={el => (componentRef.current = el)} />
                            </div>
                        </div>
                    </>
                }
            </Space>
        </>
    );
}

export default HistoryCheck;
