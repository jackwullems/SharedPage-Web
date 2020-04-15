import React from 'react';
// import Iframe from 'react-iframe'
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  // TabContent,
  TabPane,
  // Nav,
  // NavItem,
  // NavLink,
  // Progress,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';

// import classnames from 'classnames';

import img1 from '../../assets/images/users/7.jpg';
// import img2 from '../../assets/images/users/3.jpg';
// import img3 from '../../assets/images/users/4.jpg';
// import img4 from '../../assets/images/users/5.jpg';

// import time1 from '../../assets/images/big/img1.jpg';
// import time2 from '../../assets/images/big/img2.jpg';
// import time3 from '../../assets/images/big/img3.jpg';
// import time4 from '../../assets/images/big/img4.jpg';

class Profile extends React.Component {

  //Tabs
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render() {
    return <div>
      <Row>
        <Col xs="12" md="12" lg="4">
          <Card>
            <CardBody>
              <div className="text-center mt-4">
                <img src={img1} className="rounded-circle" width="150" alt="" />
                <CardTitle className="mt-2">Hanna Gover</CardTitle>
                <CardSubtitle>Accounts Manager Amix corp</CardSubtitle>
                <Row className="text-center justify-content-md-center">
                  <Col xs="4">
                    <a href="/" className="link">
                      <i className="icon-people"></i>
                      <span className="font-medium ml-2">254</span>
                    </a>
                  </Col>
                  <Col xs="4">
                    <a href="/" className="link">
                      <i className="icon-picture"></i>
                      <span className="font-medium ml-2">54</span>
                    </a>
                  </Col>
                </Row>
              </div>
            </CardBody>
            <CardBody className="border-top">
              <div>
                <small className="text-muted">Email address </small>
                <h6>hannagover@gmail.com</h6>
                <small className="text-muted pt-4 db">Phone</small>
                <h6>+91 654 784 547</h6>
                <small className="text-muted pt-4 db">Address</small>
                <h6>71 Pilgrim Avenue Chevy Chase, MD 20815</h6>
                <small className="text-muted pt-4 db">Social Profile</small>
                <br />
                <Button className="btn-circle" color="info"><i className="fab fa-facebook-f"></i></Button>{' '}
                <Button className="btn-circle" color="success"><i className="fab fa-twitter"></i></Button>{' '}
                <Button className="btn-circle" color="danger"><i className="fab fa-youtube"></i></Button>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs="12" md="12" lg="8">
          <Card>
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    <Card>
                      <CardBody>
                        <Form>
                          <FormGroup>
                            <Label>Full Name</Label>
                            <Input type="text" placeholder="Shaina Agrawal" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Email</Label>
                            <Input type="email" placeholder="Jognsmith@cool.com" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Password</Label>
                            <Input type="password" placeholder="Password" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Phone No</Label>
                            <Input type="text" placeholder="123 456 1020" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Message</Label>
                            <Input type="textarea" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Select Country</Label>
                            <Input type="select">
                              <option>USA</option>
                              <option>India</option>
                              <option>America</option>
                            </Input>
                          </FormGroup>
                          <Button color="primary">Update Profile</Button>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
          </Card>
        </Col>
      </Row>
    </div>;
  }
}

export default Profile;
