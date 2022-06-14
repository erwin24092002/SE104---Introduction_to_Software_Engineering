import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../actions/user";
import { Card, Nav } from "react-bootstrap";

function Sidebar() {
    const dispatch = useDispatch();
    const history = useHistory();
    const user = useSelector((state) => state.user);
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        dispatch(logout());
        history.push("/");
    };

    return (
        <Card>
            <Card.Header>
                <Nav variant="pills" defaultActiveKey="#first">
                    <Nav.Item>
                        <Nav.Link>
                            <Link to={"/"} className="text-decoration-none">
                                Trang chủ
                            </Link>
                        </Nav.Link>
                    </Nav.Item>
                    {user.role === "teamManager" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/newteam"}
                                    className="text-decoration-none"
                                >
                                    Đơn đăng ký
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}

                    {user.role === "admin" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/registerlist"}
                                    className="text-decoration-none"
                                >
                                    Các đơn đăng ký
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}

                    {user.role === "admin" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/calendar"}
                                    className="text-decoration-none"
                                >
                                    Lịch thi đấu
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}

                    {user.role === "teamManager" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/teamcalendar"}
                                    className="text-decoration-none"
                                >
                                    Lịch thi đấu
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}

                    <Nav.Item>
                        <Nav.Link>
                            <Link
                                to={"/search"}
                                className="text-decoration-none"
                            >
                                Tìm kiếm cầu thủ
                            </Link>
                        </Nav.Link>
                    </Nav.Item>

                    {user.role === "admin" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/rule"}
                                    className="text-decoration-none"
                                >
                                    Quy định giải đấu
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}
                    {user.role === "teamManager" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/user"}
                                    className="text-decoration-none"
                                >
                                    Người dùng
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}

                    {user.role === "admin" ? (
                        <Nav.Item>
                            <Nav.Link>
                                <Link
                                    to={"/userlist"}
                                    className="text-decoration-none"
                                >
                                    Danh sách người dùng
                                </Link>
                            </Nav.Link>
                        </Nav.Item>
                    ) : (
                        <></>
                    )}
                    <Button variant="primary" size="sm" onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Nav>
            </Card.Header>
        </Card>
    );
}

export default Sidebar;
