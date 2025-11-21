bla = [
        {
        "name": "Mihailo Pesić",
        "faculty": "Ex-member",
    },
        {
        "name": "Vukašin Rondović",
        "faculty": "Ex-member",
    },
    {
        "name": "Aleksa Bolić",
        "faculty": "Faculty of Mathematics",
    },
    {
        "name": "Aleksa Ognjanović",
        "faculty": "Faculty of Electrical Engineering",
        "source": "../assets/ognjanovic.jpg",
    },
    {
        "name": "Aleksej Milenković",
        "faculty": "Faculty of Mechanical Engineering",
    },
    {
        "name": "Filip Grujović",
        "faculty": "Faculty of Electrical Engineering",
    },
    {
        "name": "Marko Mihajlović",
        "faculty": "Faculty of Electrical Engineering",
        "source": "../assets/mihajlovic.jpg",
    },
    {
        "name": "Marko Samardžija",
        "faculty": "Faculty of Mechanical Engineering",
    },
    {
        "name": "Miloš Krneta",
        "faculty": "Faculty of Electrical Engineering",
    },
    {
        "name": "Stefan Tešmanović",
        "faculty": "Faculty of Electrical Engineering",
        "source": "../assets/tesmanovic.jpg",
    },
]

bla.sort(key=lambda x: x["name"])

print(bla)