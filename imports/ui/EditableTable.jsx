import 'antd/dist/antd.css';
import {Table, Input, Button, Popconfirm, Form} from 'antd';
import React from 'react'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    state = {
        editing: false,
    }

    componentDidMount() {
        if (this.props.editable) {
            document.addEventListener('click', this.handleClickOutside, true);
        }
    }

    componentWillUnmount() {
        if (this.props.editable) {
            document.removeEventListener('click', this.handleClickOutside, true);
        }
    }

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({editing}, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    handleClickOutside = (e) => {
        const {editing} = this.state;
        if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
            this.save();
        }
    }

    save = () => {
        const {record, handleSave} = this.props;
        this.form.validateFields((error, values) => {
            if (error) {
                return;
            }
            this.toggleEdit();
            handleSave({...record, ...values});
        });
    }

    render() {
        const {editing} = this.state;
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            ...restProps
        } = this.props;
        return (
            <td ref={node => (this.cell = node)} {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? (
                                    <FormItem style={{margin: 0}}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: [{
                                                required: true,
                                                message: `${title} is required.`,
                                            }],
                                            initialValue: record[dataIndex],
                                        })(
                                            <Input
                                                ref={node => (this.input = node)}
                                                onPressEnter={this.save}
                                            />
                                        )}
                                    </FormItem>
                                ) : (
                                    <div
                                        className="editable-cell-value-wrap"
                                        style={{paddingRight: 24}}
                                        onClick={this.toggleEdit}
                                    >
                                        {restProps.children}
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) : restProps.children}
            </td>
        );
    }
}

export default class EditableTable extends React.Component {
    componentDidUpdate() {
        console.log("Call [EditableTable] componentDidUpdate")
        console.log(this.state.dataSource)
    }

    constructor(props) {
        super(props);
        this.columns = [{
            title: 'date',
            dataIndex: 'date',
            width: '20%',
            editable: true,
        }, {
            title: 'debit',
            dataIndex: 'debit',
            width: '20%',
            editable: true,
        }, {
            title: 'credit',
            dataIndex: 'credit',
            width: '20%',
            editable: true,
        }, {
            title: 'balance',
            dataIndex: 'balance',
            width: '20%',
            editable: true,
        }, {
            title: 'action',
            dataIndex: 'action',
            width: '20%',
            render: (text, record) => {
                return (
                    this.state.dataSource.length >= 1
                        ? (
                            <a onClick={() => this.handleDelete(record.key)} href="javascript:;">Delete</a>
                        ) : null
                );
            },
        }];

        this.state = {
            dataSource: [{
                key: 0,
                date: '2018-01-01',
                debit: '125.5',
                credit: '',
                balance: '1111.0'
            }, {
                key: 1,
                date: '2018-01-01',
                debit: '425.5',
                credit: '',
                balance: '3311.0'
            }],
            count: 2,
        };
    }

    handleDelete = (key) => {
        const dataSource = [...this.state.dataSource];
        this.setState({dataSource: dataSource.filter(item => item.key !== key)});
    }

    handleAdd = () => {
        const {count, dataSource} = this.state;
        const newData = {
            key: count,
            date: '2018-01-01',
            debit: '425.5',
            credit: '',
            balance: '3311.0'
        };
        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1,
        });
    }

    handleSave = (row) => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.setState({dataSource: newData});
    }

    render() {
        const {dataSource} = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div>
                <Button onClick={this.handleAdd} type="primary" style={{marginBottom: 16}}>
                    Add a row
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}
