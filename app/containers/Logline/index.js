import React, { useState } from 'react';
import { withRouter, useParams } from 'react-router';
import {
  PageHeader,
  Descriptions,
  Select,
  Typography,
  Button,
  Modal,
  Popover,
  Input as TextField,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
// import TextField from '@material-ui/core/TextField';
import set from 'lodash/set';
import './style.scss';

import {
  GetStory,
  DeleteStory,
  CreateStory,
  UpdateStory,
  getParamsID,
} from '../../utils/APIcalls/storyline';
import { GetLocalStorage } from '../../utils/localStorage/storage';

const { Option } = Select;
const { Title, Text } = Typography;
const genreOptions = [
  'Action Adventure',
  'Thriller',
  'Romantic Comedy',
  'Horror',
  'Drama',
  'Romantic Drama',
  'Mystery',
  'Science Fiction',
  'Horror',
  'Love Story',
  'Family',
  'Fantasy',
  'Animation',
  'Western',
  'Period',
  'Historical',
  'Musical',
];
const subGenreOptions = [
  'None',
  'Comedy',
  'Horror',
  'Drama',
  'Thriller',
  'Family',
  'Psychological',
  'Political',
  'Parody',
  'Farce',
  'Slapstick',
  'Dark',
  'Epic',
  'True Story',
  'Suspense',
  'Erotic',
  'Fish-out-of water',
  'Coming-of-age',
];
class Logline extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);

    this.state = {
      id: getParamsID(4),
      paramsid: this.props.id,
      authToken: '',
      isUpdate: false,
      visible: false,
      logline: {
        character: '',
        crisis: '',
        response: '',
      },
      theme: '',
      genre: genreOptions[0],
      subGanre: subGenreOptions[0],
      title: '',
      isEdit: true,
    };
  }

  componentDidMount() {
    console.log(this.state.id);
    const user = GetLocalStorage('user');
    this.setState({ authToken: null });
    if (user) {
      this.setState({ authToken: user.tokenId });
    }

    if (this.state.id === 'new') {
      this.setState({ isEdit: true });
    } else {
      this.setState({ isEdit: false, isUpdate: true });
      GetStory(this.state.id, user && user.tokenId)
        .then(json => {
          if(json.msg === "NOT VALID"){
            return history.push('/login');
          }
          console.log("Fetch story")
          console.log(json);
          this.setState({ 
            theme: json.theme ? json.theme : null ,
            title: json.title ? json.title : null,
          });
          this.setState(prevstate => ({
            logline: {
              ...prevstate.logline,
              character: json.logline ? (json.logline.character ? json.logline.character : null) : null ,
              crisis: json.logline ? (json.logline.crisis ? json.logline.crisis : null) : null,
              response: json.logline ? (json.logline.response ? json.logline.response : null) : null,
            },
          }));
          console.log(this.state);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  delete = () => {
    DeleteStory(this.state.id, this.state.authToken)
      .then(response => {
        console.log(response);
        if(response.msg === "NOT VALID"){
          return history.push('/login');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  setVisible = value => {
    this.setState({ visible: value });
  };

  setFieldValue = (path, value) => {
    this.setState(prev => {
      const newState = set(prev, path, value);
      return newState;
    });
  };

  getShortLogline = () => {
    const { logline } = this.state;
    return `${logline.character} ${logline.crisis} ${logline.response}`;
  };

  onSave = () => {
    this.setState({ isEdit: false });
    const story = {
      logline: {
        crisis: this.state.logline.crisis,
        response: this.state.logline.response,
      },
      theme: this.state.theme,
      genre: this.state.genre,
      subGenre: this.state.subGenre,
      title: this.state.title,
    };
    CreateStory(story, this.state.authToken)
      .then(function(response) {
        console.log(response);
        if(response.msg === "NOT VALID"){
          return history.push('/login');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  update = () => {
    const story = {
      logline: {
        crisis: this.state.logline.crisis,
        response: this.state.logline.response,
      },
      theme: this.state.theme,
      genre: this.state.genre,
      subGenre: this.state.subGenre,
      title: this.state.title,
    };
    UpdateStory(story, this.state.id, this.state.authToken)
      .then(function(response) {
        console.log(response);
        if(response.msg === "NOT VALID"){
          return history.push('/login');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  onEdit = () => {
    this.setState({ isEdit: true });
  };

  render() {
    const {
      logline,
      visible,
      theme,
      genre,
      subGanre,
      title,
      isEdit,
    } = this.state;
    const { setVisible, setFieldValue } = this;
    return (
      <div className="logline-container">
        <Button type="link" onClick={() => setVisible(true)}>
          How to write a logline
        </Button>
        {isEdit ? (
          <div className="logline-create">
            <div>
              <PageHeader
                title="1. Your Story Idea"
                subTitle={
                  <Popover
                    sm="click"
                    trigger="hover"
                    content="These three questions will get at the guts of your story. Sentence length is limited - if you find you can't add more letters, use fewer or shorter words."
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                }
              >
                <Descriptions column={1}>
                  <Descriptions.Item
                    label={
                      <div>
                        a. Your main character{' '}
                        <Popover
                          sm="click"
                          trigger="hover"
                          content={
                            <div>
                              (use adjectives, emotional state) who wants x (a
                              basic desire){' '}
                              <div>
                                E.g., A shy young suburban boy who wants to be
                                noticed
                              </div>
                            </div>
                          }
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </div>
                    }
                  />
                  <Descriptions.Item>
                    <TextField
                      value={logline.character}
                      onChange={ev =>
                        setFieldValue('logline.character', ev.target.value)
                      }
                      fullWidth
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <div>
                        b. Crisis{' '}
                        <Popover
                          sm="click"
                          trigger="hover"
                          content={
                            <div>
                              what crisis he/she/are they facing ?{' '}
                              <div>Hint: Start with an ACTIVE VERB.</div>{' '}
                              <div>
                                E.g., discovers a strange but friendly alien
                                living in his shed
                              </div>
                            </div>
                          }
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </div>
                    }
                  />
                  <Descriptions.Item>
                    <TextField
                      value={logline.crisis}
                      onChange={ev =>
                        setFieldValue('logline.crisis', ev.target.value)
                      }
                      fullWidth
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <div>
                        c. Response{' '}
                        <Popover
                          sm="click"
                          trigger="hover"
                          content={
                            <div>
                              How does he/she/do they respond to try and deal
                              with it ? <div>Hint: Not too much detail.</div>
                              <div>
                                E.g., and tries to help him get home while
                                keeping his existence a secret. (E.T., The Extra
                                Terrestrial)
                              </div>
                            </div>
                          }
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </div>
                    }
                  />
                  <Descriptions.Item>
                    <TextField
                      value={logline.response}
                      onChange={ev =>
                        setFieldValue('logline.response', ev.target.value)
                      }
                      fullWidth
                    />
                  </Descriptions.Item>
                </Descriptions>
              </PageHeader>
            </div>
            <div>
              <PageHeader title="2. What type of film is it?">
                <Descriptions column={1}>
                  <Descriptions.Item>
                    <Text>Genre: </Text>
                    <Select
                      name="Genre"
                      value={genre}
                      style={{ width: 200 }}
                      onChange={value => setFieldValue('genre', value)}
                    >
                      {genreOptions.map((g, i) => (
                        <Option key={`genre-${i}`} value={g}>
                          {g}
                        </Option>
                      ))}
                    </Select>
                  </Descriptions.Item>
                  <Descriptions.Item>
                    <Text>Sub-Genre: </Text>
                    <Select
                      name="Sub-Genre"
                      value={subGanre}
                      style={{ width: 200 }}
                      onChange={value => setFieldValue('subGanre', value)}
                    >
                      {subGenreOptions.map((s, i) => (
                        <Option key={`sub-genre-${i}`} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>
                  </Descriptions.Item>
                </Descriptions>
              </PageHeader>
            </div>
            <div>
              <PageHeader
                title="3. Your Theme"
                subTitle={
                  <Popover
                    sm="click"
                    trigger="hover"
                    content={
                      <div>
                        THEME is what people want to know when they ask that
                        annoying question, "So what's it about?"{' '}
                        <div>
                          Make it a one word answer, as corny as it may sound,
                          like Love, Betrayal, or Prejudice. Philadelphia, for
                          example is a story about prejudice; Star Wars is a
                          story about heroism.
                        </div>
                      </div>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                }
              >
                <Descriptions column={1}>
                  <Descriptions.Item>
                    <TextField
                      value={theme}
                      onChange={ev => setFieldValue('theme', ev.target.value)}
                      fullWidth
                    />
                  </Descriptions.Item>
                </Descriptions>
              </PageHeader>
            </div>
            <div>
              <PageHeader
                title="4. Your Title"
                subTitle={
                  <Popover
                    sm="click"
                    trigger="hover"
                    content="Based on your theme, choose a title (for now)."
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                }
              >
                <Descriptions column={1}>
                  <Descriptions.Item>
                    <TextField
                      value={title}
                      onChange={ev => setFieldValue('title', ev.target.value)}
                      fullWidth
                    />
                  </Descriptions.Item>
                  {this.isUpdate ? (
                    <Descriptions.Item>
                      <Button onClick={this.update} type="primary">
                        Update
                      </Button>
                    </Descriptions.Item>
                  ) : (
                    <Descriptions.Item>
                      <Button onClick={this.onSave} type="primary">
                        Save
                      </Button>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </PageHeader>
            </div>
          </div>
        ) : (
          <div className="logline-view">
            <PageHeader ghost={false} title={title}>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Logline (elivator pitch)">
                  {this.getShortLogline()}
                </Descriptions.Item>
                <Descriptions.Item label="Theme">{theme}</Descriptions.Item>
                <Descriptions.Item label="Genre">
                  {genre}, {subGanre}
                </Descriptions.Item>
                <Descriptions.Item label="Writer(s)">
                  name of user
                </Descriptions.Item>
                <Descriptions.Item label="Last modified">
                  2017-01-10
                </Descriptions.Item>
              </Descriptions>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button key="2">Print</Button>
                <Button key="1" type="primary" onClick={this.onEdit}>
                  Edit
                </Button>
                <Button type="primary" danger onClick={this.delete}>
                  Delete
                </Button>
              </div>
            </PageHeader>
          </div>
        )}

        <Modal
          title="How to write log line"
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          width={600}
          footer={null}
        >
          <iframe
            title=" "
            width="560"
            height="315"
            src="https://www.youtube.com/embed/r0Fj_H9Q73k"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Modal>
      </div>
    );
  }
}
export default withRouter(Logline);

// {/* <EditableDiv placeholder="describe the story" {...props} value={props.content[props.id]}/> */}
