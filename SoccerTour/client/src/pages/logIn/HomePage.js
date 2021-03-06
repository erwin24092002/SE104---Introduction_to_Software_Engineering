import React from "react";
import {
    Container,
    Navbar,
    Row,
    Col,
    Button,
    Modal,
    Form,
} from "react-bootstrap";
import "./HomePage.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { signin, signup } from "../../actions/user.js";

const initializeRegisterFormData = {
    phoneNumber: "",
    country: "",
    userName: "",
    password: "",
};

const initializeLoginFormData = {
    userName: "",
    password: "",
};

const HomePage = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [loginFormData, setLoginFormData] = useState(initializeLoginFormData);
    const [registerFormData, setRegisterFormData] = useState(
        initializeRegisterFormData
    );
    const [reenterPassword, setReenterPassword] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    useEffect(() => {
        setRegisterFormData(initializeRegisterFormData);
        setReenterPassword("");
    }, [isSuccess]);
    const dispatch = useDispatch();
    const history = useHistory();

    const [isLogin, setIsLogin] = useState(false);
    useEffect(() => {
        if (isLogin) {
            history.push("/tour");
        }
    }, [isLogin]);

    const loginFormClose = () => {
        setLoginFormData(initializeLoginFormData);
        setShowLoginForm(false);
    };

    const loginFormHandleChange = (e) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };

    const loginFormSubmit = (e) => {
        e.preventDefault();
        dispatch(signin(loginFormData, setIsLogin));
    };

    const registerFormHandleChange = (e) => {
        setRegisterFormData({
            ...registerFormData,
            [e.target.name]: e.target.value,
        });
    };

    const registerFormSubmit = async (e) => {
        if (reenterPassword && reenterPassword === registerFormData.password) {
            await dispatch(signup(registerFormData, setIsSuccess));
        } else {
            alert("Please confirm password");
        }
    };

    return (
        <Container fluid>
            <div className="home-page"></div>
            <Navbar>
                <Container fluid>
                    <Navbar.Brand href="#home" className="text-white">
                        Soccer Tour
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Button
                            variant="secondary"
                            className="mx-3"
                            onClick={() => setShowLoginForm(true)}
                        >
                            ????ng nh???p
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowRegisterForm(true)}
                        >
                            ????ng k??
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* <ModalLogin /> */}
            <Modal show={showLoginForm} onHide={() => loginFormClose()}>
                <Modal.Header closeButton>
                    <Modal.Title>????ng nh???p</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={loginFormSubmit}>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>T??n ????ng nh???p</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nh???p username"
                                    name="userName"
                                    onChange={loginFormHandleChange}
                                    value={loginFormData.userName}
                                    autoFocus
                                />
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>M???t kh???u</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nh???p m???t kh???u"
                                    name="password"
                                    onChange={loginFormHandleChange}
                                    value={loginFormData.password}
                                />
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col className="text-center">
                                <Button
                                    variant="secondary"
                                    type="submit"
                                    className="w-100"
                                    onClick={loginFormSubmit}
                                >
                                    ????ng nh???p
                                </Button>
                            </Col>
                        </Row>
                        <Row className="my-4 text-center">
                            <Col>Qu??n m???t kh???u</Col>
                        </Row>
                        <Row className="my-4">
                            <p className="my-1">
                                <small>????ng nh???p b???ng</small>
                            </p>
                            <Col>
                                <Button variant="primary" className="w-100">
                                    Facebook
                                </Button>
                            </Col>
                            <Col>
                                <Button variant="secondary" className="w-100">
                                    Google
                                </Button>
                            </Col>
                        </Row>
                        <Row className="my-4">
                            <p className="my-1">
                                <small>Ch??a c?? t??i kho???n?</small>
                            </p>
                            <Col>
                                <Button
                                    variant="secondary"
                                    className="w-100"
                                    onClick={() => {
                                        loginFormClose();
                                        setShowRegisterForm(true);
                                    }}
                                >
                                    ????ng k??
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* <ModalRegister /> */}
            {/* <Modal
                show={showRegisterForm}
                onHide={() => {
                    setShowRegisterForm(false);
                    if (isSuccess) {
                        setIsSuccess(false);
                    }
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>????ng k??</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={registerFormSubmit}>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>S??? ??i???n tho???i</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Nh???p s??? ??i???n tho???i"
                                    name="phoneNumber"
                                    pattern="[0-9]{10}"
                                    value={registerFormData.phoneNumber}
                                    onChange={registerFormHandleChange}
                                    required
                                />
                            </Col>
                            <Col>
                                <Form.Label>Country</Form.Label>
                                <Form.Select
                                    aria-label="Default select example"
                                    onChange={registerFormHandleChange}
                                    name="country"
                                    required
                                >
                                    <option>Select your country</option>
                                    <option value="Vi???t Nam">Vi???t Nam</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>T??n t??i kho???n</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nh???p t??n t??i kho???n"
                                    name="userName"
                                    value={registerFormData.userName}
                                    onChange={registerFormHandleChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>M???t kh???u</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nh???p m???t kh???u"
                                    name="password"
                                    value={registerFormData.password}
                                    onChange={registerFormHandleChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col>
                                <Form.Label>X??c nh???n m???t kh???u</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nh???p l???i m???t kh???u"
                                    name="reenterPassword"
                                    value={reenterPassword}
                                    onChange={(e) =>
                                        setReenterPassword(e.target.value)
                                    }
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="my-2">
                            <Col className="text-center">
                                <Button
                                    variant={isSuccess ? "primary" : "secondary"}
                                    className="w-100"
                                    type="submit"
                                    disabled={isSuccess}
                                >
                                    {isSuccess
                                        ? "????ng k?? th??nh c??ng"
                                        : "X??c nh???n ????ng k??"}
                                </Button>
                            </Col>
                        </Row>
                        {isSuccess ? (
                            <Row className="my-2">
                                <Col className="text-center">
                                    <Button
                                        variant="dark"
                                        className="w-100"
                                        onClick={() => {
                                            setShowRegisterForm(false);
                                            setShowLoginForm(true);
                                            setIsSuccess(false);
                                        }}
                                    >
                                        ?????n m??n h??nh ????ng nh???p
                                    </Button>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        <Row className="my-4">
                            <p className="my-1">
                                <small>????ng nh???p b???ng</small>
                            </p>
                            <Col>
                                <Button
                                    variant="primary"
                                    className="w-100"
                                    disabled={isSuccess}
                                >
                                    Facebook
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    variant="secondary"
                                    className="w-100"
                                    disabled={isSuccess}
                                >
                                    Google
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal> */}

            {/* <Container
                fluid
                className="text-center text-white"
                style={{
                    position: "relative",
                }}
            >
                <h1 className="my-5">Simple Approach to Manage Tournaments!</h1>
                <p className="my-1">
                    FootballTour.com to simplify tournament management process
                    in order to save your time
                </p>
                <p className="my-1">Join us now and you will love this.</p>
                <p className="my-5">
                    FootballTour t???? tin ??a??p ????ng ????????c nh????ng nhu c????u th???? thao ma??
                    ng??????i qu???n l?? ??o??i ho??i v????i ch????t l??????ng tuy????t v????i nh????t. Kh??n
                    gi??? y??u th??ch b??ng ???? ho??n to??n c?? th??? th???a m??n ??am m?? c???a
                    m??nh nh??? h??? th???ng tra c???u v?? qu???n l?? b??ng ???? m?? ch??ng t??i
                    cung c???p. Ch???c ch???n c??c b???n s??? c???m th???y h??i l??ng v???i nh???ng
                    d???ch v??? ???????c cung c???p.
                </p>

                <Row>
                    <Col>
                        <h3>1.509</h3>
                        <p>GI???I ?????U</p>
                    </Col>
                    <Col>
                        <h3>40.320</h3>
                        <p>?????I</p>
                    </Col>
                    <Col>
                        <h3>1.052.202</h3>
                        <p>L?????T XEM</p>
                    </Col>
                </Row>
            </Container> */}
        </Container>
    );
};

export default HomePage;
