import 'antd/dist/antd.css';
import {Table, Button, Form, Divider, Icon, Tag, Row, Col, Popconfirm} from 'antd';
import React from 'react'
import PropTypes from 'prop-types';
import './TransactionEditableTable.css'
import {withTracker} from 'meteor/react-meteor-data';
import {Meteor} from "meteor/meteor";
import iziToast from 'iziToast';
import 'izitoast/dist/css/iziToast.min.css'
import TransactionEditableCell from './TransactionEditableCell.jsx'
import _ from "lodash";

const initial_transactions = [{date: "2018-01-01", debit: "", credit: "100", balance: "1000"}];

const EditableRow = ({form, index, ...props}) => (
    <tr {...props} />
);

class TransactionEditableTable extends React.Component {
    static propTypes = {
        transactions: PropTypes.array,
    };

    constructor(props) {
        console.log("[TransactionEditableTable] constructor");
        super(props);
        this.columns = [
            {
                title: '',
                key: 'key',
                dataIndex: 'key',
                render: (text, record) => <span>{record.no + 1}</span>,
                width: 50
            }, {
                title: 'date',
                dataIndex: 'date',
                width: 200,
                editable: true,
            }, {
                title: 'debit',
                dataIndex: 'debit',
                width: 200,
                editable: true,
            }, {
                title: 'credit',
                dataIndex: 'credit',
                width: 200,
                editable: true,
            }, {
                title: 'balance',
                dataIndex: 'balance',
                width: 200,
                editable: true,
            }, {
                title: '',
                dataIndex: 'action',
                width: 200,
                render: (text, record) => {
                    return (
                        this.state.isEditing
                            ? (<span>
                        <span className={"link"} onClick={() => this.handleInsertAbove(record.key)}>
                            <Icon type="up"/>
                            </span>
                        <Divider type="vertical"/>
                        <span className={"link"} onClick={() => this.handleInsertBelow(record.key)}>  <Icon
                            type="down"/></span>
                        <Divider type="vertical"/>
                        <span className={"link"} style={{color: 'red'}} onClick={() => this.handleDelete(record.key)}
                        >  <Icon type="delete"/></span>
                            </span>) :
                            (<span>
                         <span style={{color: 'grey'}}>  <Icon type="up"/></span>
                        <Divider type="vertical"/>
                         <span style={{color: 'grey'}}>  <Icon type="down"/></span>
                        <Divider type="vertical"/>
                        <span style={{color: 'grey'}}>  <Icon type="delete"/></span></span>)
                    );
                },
            }];
        TransactionEditableTable.initialDataKey(initial_transactions);
        TransactionEditableTable.resetDataNo(initial_transactions);
        this.state = {
            transactions: initial_transactions,
            count: initial_transactions.length,
            nextFocusNo: null,
            nextFocusDataIndex: "date",
            isEditing: false,
            tranTableHeight: 400
        };
        this.onClickVerifyAndSave = this.onClickVerifyAndSave.bind(this);
        this.cleanNextFocus = this.cleanNextFocus.bind(this);
        this.setNextFocus = this.setNextFocus.bind(this);
        this.toggleEditingMode = this.toggleEditingMode.bind(this);
        this.updateTranTableHeight = this.updateTranTableHeight.bind(this);
    }

    componentDidMount() {
        console.log("[TransactionEditableTable] componentDidMount");
        this.updateTranTableHeight();
        window.addEventListener('resize', this.updateTranTableHeight);
    }

    componentWillUnmount() {
        console.log("[TransactionEditableTable] componentWillUnMount");
        window.removeEventListener('resize', this.updateTranTableHeight);
    }

    updateTranTableHeight() {
        let windowHeight = window.innerHeight;
        // console.log("Window height: " + windowHeight);
        let tranTableHeight = 400;
        if (windowHeight >= 768) {
            tranTableHeight += (windowHeight - 768)
        }
        this.setState({tranTableHeight: tranTableHeight})
    }

    componentDidUpdate(previousProps, previousState) {
        // console.log("[TransactionEditableTable] componentDidUpdate");
        // console.log(this.state.transactions)
        // if (previousProps.transactions !== this.props.transactions) {
        //     this.setState({transactions: this.props.transactions})
        // }
    }

    cleanNextFocus() {
        this.setState({nextFocusNo: null, nextFocusDataIndex: "date"})
    }

    setNextFocus(nextFocusNo, nextFocusDataIndex) {
        this.setState({nextFocusNo, nextFocusDataIndex})
    }

    static createNewData(key) {
        return {
            key: key,
            date: '',
            debit: '',
            credit: '',
            balance: ''
        }
    }

    static initialDataKey(transactions) {
        for (let i = 0; i < transactions.length; i++) {
            transactions[i]["key"] = i;
        }
    }

    static resetDataNo(transactions) {
        for (let i = 0; i < transactions.length; i++) {
            transactions[i]["no"] = i;
        }
    }

    handleInsertAbove = (key) => {
        // console.log("handle Insert Above Key: ", key);
        const {count, transactions} = this.state;
        let index = transactions.findIndex(item => key === item.key);
        transactions.splice(index, 0, TransactionEditableTable.createNewData(count));
        TransactionEditableTable.resetDataNo(transactions);
        this.setState({
            transactions: transactions,
            nextFocusNo: index,
            count: count + 1
        });

    };

    handleInsertBelow = (key) => {
        // console.log("handle Insert Below Key: ", key);
        const {count, transactions} = this.state;
        let index = transactions.findIndex(item => key === item.key);
        transactions.splice(index + 1, 0, TransactionEditableTable.createNewData(count));
        TransactionEditableTable.resetDataNo(transactions);
        this.setState({
            transactions: transactions,
            nextFocusNo: index + 1,
            count: count + 1
        });
    };

    handleDelete = (key) => {
        // console.log("handle delete key: ", key);
        let index = this.state.transactions.findIndex(item => key === item.key);
        if (index === this.state.transactions.length - 1) {
            index = index - 1
        }
        const transactions = this.state.transactions.filter(item => item.key !== key);
        TransactionEditableTable.resetDataNo(transactions);
        this.setState({transactions: transactions, nextFocusNo: index});
    };

    handleAdd = () => {
        const {count} = this.state;
        const newData = TransactionEditableTable.createNewData(count);
        let transactions = [...this.state.transactions, newData];
        TransactionEditableTable.resetDataNo(transactions);
        this.setState({
            transactions: transactions,
            nextFocusNo: this.state.transactions.length,
            count: count + 1
        });
    };

    handleSaveCell = (key, dataIndex, value) => {
        // console.log("[TransactionEditableTable] Handle save cell");
        const {transactions} = this.state;
        const index = transactions.findIndex(item => key === item.key);
        transactions[index][dataIndex] = value;
        this.setState({transactions: transactions});
    };

    sendRequestVerifyAndSaveTransactions(transactions) {
        Meteor.call('sendVerifyAndSaveRequest', transactions, (err, result) => {
            console.log("Callback from Meteor method 'sendVerifyAndSaveRequest'");
            if (err) {
                console.error(err);
                let err_msg;
                try {
                    err_msg = 'Verify failed, ' + err.error.response.data.msg;
                }
                catch (e) {
                    err_msg = JSON.stringify(err);
                }
                iziToast.error({
                    title: 'Error',
                    message: err_msg,
                    position: 'topRight',
                    timeout: 5000
                });
            }
            else {
                iziToast.success({
                    title: 'Success',
                    message: 'Verify Passed, Saved',
                    position: 'topRight'
                });
                this.setState({isEditing: false})
            }
        });
    }

    onClickVerifyAndSave(event) {
        console.log("[TransactionEditableTable] onClickVerifyAndSave");
        console.log(this.state.transactions);
        event.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('validate form success', values);
                this.sendRequestVerifyAndSaveTransactions(this.state.transactions);
            }
            else {
                console.log("validate form error:", err)
            }
        });
    }

    toggleEditingMode() {
        this.setState({isEditing: !this.state.isEditing})
    }

    renderTableActionsPanel() {
        return <div style={{textAlign: "center", marginTop: "16px"}}>
            {this.state.isEditing ?
                <Button type="default" onClick={this.toggleEditingMode}>
                    <Icon type="lock"/> Disable Editing
                </Button> :
                <Button type="default" onClick={this.toggleEditingMode}>
                    <Icon type="unlock"/> Enable Editing
                </Button>}
            <Popconfirm placement="rightBottom" title="Confirm?" onConfirm={this.onClickVerifyAndSave} okText="Yes"
                        cancelText="No">
                <Button type="primary" style={{marginLeft: "10px"}}>
                    <Icon type="check"/>Verify and Save
                </Button>
            </Popconfirm>
        </div>
    }

    render() {
        const components = {
            body: {
                row: EditableRow,
                cell: TransactionEditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record, rowIndex) => {
                    return {
                        record,
                        editable: col.editable,
                        dataIndex: col.dataIndex,
                        title: col.title,
                        handleSaveCell: this.handleSaveCell,
                        handleInsertBelow: this.handleInsertBelow,
                        handleDelete: this.handleDelete,
                        nextFocusNo: this.state.nextFocusNo,
                        nextFocusDataIndex: this.state.nextFocusDataIndex,
                        setNextFocus: this.setNextFocus,
                        cleanNextFocus: this.cleanNextFocus,
                        isEditing: this.state.isEditing,
                        form: this.props.form,
                    }
                },
            };
        });
        return <Form>
            <Row type="flex" justify={"space-between"} align="bottom" style={{marginBottom: 16}}>
                <Col span={3}>
                    <Button onClick={this.handleAdd} type="default" disabled={!this.state.isEditing}>
                        <Icon type="plus"/> Add row
                    </Button>
                </Col>
                <Col span={3}>
                    <Tag color="blue">Total {this.state.transactions.length}</Tag>
                </Col>
            </Row>
            <Table
                size={"small"}
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={this.state.transactions}
                columns={columns}
                pagination={false}
                scroll={{y: this.state.tranTableHeight}}
            />
            {this.renderTableActionsPanel()}
        </Form>
    }
}

export default Form.create()(TransactionEditableTable);