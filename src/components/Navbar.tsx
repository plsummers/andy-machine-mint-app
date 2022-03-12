import styled from "styled-components";

const Container = styled("div")`
    width: 480px;
    height: 20px;
    background-color: #ffffff;

    display: flex;
    justify-content: center;
    align-items: center;
    
    position: relative;
`

const Title = styled("h1")`
    margin: 0;
    white-space: nowrap;
     justify-content: center;
    align-items: center;
    position: relative;
`

const Link = styled("a")`
    font-size: 1.5rem;
    margin: 1rem;
    cursor: pointer;
    color: initial;
     justify-content: center;
    align-items: center;
    position: relative;
    }
`

const Navbar = () => {
    return (
        <Container>
            <Title>
              <Link href="https://soletters.io/">
                SOLETTERS.IO
                </Link>
            </Title>
        </Container>
    )
}

export default Navbar;
