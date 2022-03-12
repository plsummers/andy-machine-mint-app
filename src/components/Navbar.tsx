import styled from "styled-components";

const Container1 = styled("div")`
    width: 100vw;
    height: 100px;
    background-color: #ffffff;

    display: flex;
    justify-content: center;
    align-items: end;
`

const Title1 = styled("h1")`
    margin-top: 5em;
`

const Navbar = () => {
    return (
        <Container1>
            <Title1>
              
                SOLETTERS.IO
               
            </Title1>
        </Container1>
    )
}

export default Navbar;
